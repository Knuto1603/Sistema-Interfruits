// services/navigation.service.ts
import { inject, Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, forkJoin, of, Subscription, combineLatest } from 'rxjs';
import { map, tap, catchError, switchMap, filter, distinctUntilChanged, takeUntil, debounceTime, take } from 'rxjs/operators';
import { INavData } from '@coreui/angular';
import { AuthService } from '@core/auth/auth.service';
import { navItems } from '../../layout/default-layout/_nav';
import { RoleSharedService } from '@modules/auth/role/repository/role-shared.service';
import { RoleShared } from "@modules/auth/role/interface/role.interface";

/**
 * Interfaz para el cache de navegación
 */
interface NavigationCache {
  items: INavData[];
  userId: string;
  userRoleIds: string[];
  timestamp: number;
  version: string; // Para versioning de la estructura de navegación
}

/**
 * Interfaz para una sección de navegación (título + elementos)
 */
interface NavigationSection {
  title: INavData | null;
  items: INavData[];
  titleIndex: number;
  startIndex: number;
  endIndex: number;
}

/**
 * Interfaz para el resultado de verificación de sección
 */
interface SectionAccessResult {
  section: NavigationSection;
  titleHasAccess: boolean;
  itemsWithAccess: INavData[];
}

/**
 * Interfaz para verificación de acceso individual
 */
interface ItemAccessResult {
  item: INavData;
  hasAccess: boolean;
  originalIndex: number;
}

@Injectable({
  providedIn: 'root'
})
export class NavigationService implements OnDestroy {
  // ========================================
  // PROPIEDADES PRIVADAS
  // ========================================
  private _filteredNavItems = new BehaviorSubject<INavData[]>([]);
  private roleService: RoleSharedService = inject(RoleSharedService);
  private subscriptions = new Subscription();
  private isProcessing = false;

  // ========================================
  // CACHE DE NAVEGACIÓN - NUEVA FUNCIONALIDAD
  // ========================================
  private readonly NAVIGATION_CACHE_KEY = 'navigation_cache';
  private readonly CACHE_EXPIRATION_MINUTES = 30; // 30 minutos
  private readonly NAVIGATION_VERSION = '1.0'; // Incrementar cuando cambie estructura de _nav.ts

  private _navigationCache: NavigationCache | null = null;

  // ========================================
  // CONSTRUCTOR - Configuración reactiva
  // ========================================
  constructor(private _authService: AuthService) {
    this.initializeNavigationCache();
    this.setupReactiveNavigation();
  }

  // ========================================
  // LIMPIEZA DE RECURSOS
  // ========================================
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // ========================================
  // GETTER PÚBLICO
  // ========================================
  get filteredNavItems$(): Observable<INavData[]> {
    return this._filteredNavItems.asObservable().pipe(
      distinctUntilChanged()
    );
  }

  // ========================================
  // INICIALIZACIÓN DE CACHE
  // ========================================

  /**
   * Inicializar cache de navegación desde localStorage
   */
  private initializeNavigationCache(): void {

    try {
      const cachedData = localStorage.getItem(this.NAVIGATION_CACHE_KEY);
      if (cachedData) {
        this._navigationCache = JSON.parse(cachedData) as NavigationCache;
        console.log('📋 Found navigation cache for user:', this._navigationCache.userId);
      } else {
        console.log('📝 No navigation cache found');
      }
    } catch (error) {
      console.warn('⚠️ Error reading navigation cache:', error);
      this._navigationCache = null;
    }
  }

  /**
   * Verificar si el cache de navegación es válido para el usuario actual
   */
  private async isNavigationCacheValid(user: any): Promise<boolean> {
    if (!this._navigationCache) {
      return false;
    }

    // Verificar usuario
    if (this._navigationCache.userId !== user.id) {

      return false;
    }

    // Verificar versión
    if (this._navigationCache.version !== this.NAVIGATION_VERSION) {
      return false;
    }

    // Verificar expiración
    const cacheAge = Date.now() - this._navigationCache.timestamp;
    const maxAge = this.CACHE_EXPIRATION_MINUTES * 60 * 1000;
    if (cacheAge > maxAge) {
      return false;
    }

    // Verificar si los roles del usuario han cambiado
    try {
      const currentUserRoles = await this._authService.getUserRoles().pipe(take(1)).toPromise();
      const currentRoleIds = (currentUserRoles ?? []).map(role => role.id).sort();
      const cachedRoleIds = [...this._navigationCache.userRoleIds].sort();

      const rolesChanged = JSON.stringify(currentRoleIds) !== JSON.stringify(cachedRoleIds);
      if (rolesChanged) {
        return false;
      }

      return true;

    } catch (error) {
      return false;
    }
  }

  /**
   * Guardar cache de navegación
   */
  private async saveNavigationCache(items: INavData[], user: any): Promise<void> {
    try {
      const userRoles = await this._authService.getUserRoles().pipe(take(1)).toPromise();
      const userRoleIds = (userRoles ?? []).map(role => role.id);

      const cacheData: NavigationCache = {
        items,
        userId: user.id,
        userRoleIds,
        timestamp: Date.now(),
        version: this.NAVIGATION_VERSION
      };

      this._navigationCache = cacheData;
      localStorage.setItem(this.NAVIGATION_CACHE_KEY, JSON.stringify(cacheData));

    } catch (error) {
      console.error('❌ Error saving navigation cache:', error);
    }
  }

  /**
   * Limpiar cache de navegación
   */
  private clearNavigationCache(): void {
    this._navigationCache = null;
    localStorage.removeItem(this.NAVIGATION_CACHE_KEY);
  }

  // ========================================
  // CONFIGURACIÓN REACTIVA OPTIMIZADA
  // ========================================

  /**
   * Configurar navegación reactiva que responde a cambios de autenticación
   */
  private setupReactiveNavigation(): void {

    const navigationTriggers$ = combineLatest([
      this._authService.isAuthenticated$,
      this._authService.currentUser$
    ]).pipe(
      debounceTime(100),
      distinctUntilChanged(([prevAuth, prevUser], [currAuth, currUser]) => {
        const authChanged = prevAuth !== currAuth;
        const userChanged = (prevUser?.id || null) !== (currUser?.id || null);
        return !authChanged && !userChanged;
      })
    );

    const subscription = navigationTriggers$.subscribe(
      ([isAuthenticated, user]) => {
        if (isAuthenticated && user) {
          this.refreshNavigationForUserWithCache(user);
        } else {
          this.clearNavigation();
        }
      }
    );

    this.subscriptions.add(subscription);
  }

  /**
   * Refrescar navegación con verificación de cache
   */
  private async refreshNavigationForUserWithCache(user: any): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    try {
      // Verificar si podemos usar cache
      const cacheValid = await this.isNavigationCacheValid(user);

      if (cacheValid && this._navigationCache) {
        this._filteredNavItems.next(this._navigationCache.items);
        this.isProcessing = false;
        return;
      }

      // Cache no válido, recalcular navegación

      // NO limpiar cache de roles aquí - solo si realmente cambió el usuario
      if (!this._navigationCache || this._navigationCache.userId !== user.id) {
        this.clearRolesCaches();
      }

      this.initializeNavigationWithCache(user);

    } catch (error) {
      // Fallback: recalcular sin cache
      this.clearRolesCaches();
      this.initializeNavigationWithCache(user);
    }
  }

  /**
   * Refrescar navegación para un usuario específico (método original mantenido para compatibilidad)
   */
  private refreshNavigationForUser(user: any): void {
    this.refreshNavigationForUserWithCache(user);
  }

  /**
   * Limpiar navegación cuando no hay usuario autenticado
   */
  private clearNavigation(): void {
    this.clearNavigationCache(); // Limpiar cache también
    this._filteredNavItems.next([]);
  }

  /**
   * Limpiar todos los caches relacionados con roles
   */
  private clearRolesCaches(): void {

    if (this.roleService.clearData) {
      this.roleService.clearData();
    }

    if (this._authService.refreshUserRoles) {
      this._authService.refreshUserRoles().subscribe();
    }
  }

  // ========================================
  // MÉTODOS PÚBLICOS MEJORADOS
  // ========================================

  /**
   * Refrescar navegación manualmente
   */
  public refreshNavigation(): void {

    this._authService.currentUser$.pipe(
      filter(user => !!user),
      take(1)
    ).subscribe(user => {
      this.refreshNavigationForUserWithCache(user);
    });
  }

  /**
   * Forzar limpieza completa y reinicialización
   */
  public forceRefresh(): void {
    this.isProcessing = false;
    this.clearNavigationCache(); // Limpiar cache de navegación
    this.clearRolesCaches();

    setTimeout(() => {
      this.refreshNavigation();
    }, 100);
  }

  /**
   * Obtener información del cache de navegación
   */
  public getCacheInfo(): {
    hasCache: boolean;
    userId: string | null;
    itemCount: number;
    age: number; // en minutos
    isValid: boolean;
  } {
    if (!this._navigationCache) {
      return {
        hasCache: false,
        userId: null,
        itemCount: 0,
        age: 0,
        isValid: false
      };
    }

    const ageMs = Date.now() - this._navigationCache.timestamp;
    const ageMinutes = Math.round(ageMs / 60000);
    const maxAge = this.CACHE_EXPIRATION_MINUTES * 60 * 1000;

    return {
      hasCache: true,
      userId: this._navigationCache.userId,
      itemCount: this._navigationCache.items.length,
      age: ageMinutes,
      isValid: ageMs < maxAge && this._navigationCache.version === this.NAVIGATION_VERSION
    };
  }

  // ========================================
  // INICIALIZACIÓN CON CACHE
  // ========================================

  /**
   * Inicializar navegación con guardado de cache
   */
  private initializeNavigationWithCache(user: any): void {

    this._authService.isAuthenticated$.pipe(
      filter(isAuth => isAuth === true),
      take(1),
      switchMap(() => {
        return this.filterNavigationWithHierarchy(navItems);
      })
    ).subscribe({
      next: (filteredItems) => this.onNavigationFilteredWithCache(filteredItems, user),
      error: (error) => this.onNavigationError(error),
      complete: () => {
        this.isProcessing = false;
      }
    });
  }

  /**
   * Manejar navegación filtrada exitosamente con guardado de cache
   */
  private onNavigationFilteredWithCache(filteredItems: INavData[], user: any): void {

    // Emitir items
    this._filteredNavItems.next(filteredItems);

    // Guardar en cache
    this.saveNavigationCache(filteredItems, user);
  }

  /**
   * Inicializar navegación (método original mantenido para compatibilidad)
   */
  private initializeNavigation(): void {
    this._authService.currentUser$.pipe(
      filter(user => !!user),
      take(1)
    ).subscribe(user => {
      this.initializeNavigationWithCache(user);
    });
  }

  // ========================================
  // RESTO DE MÉTODOS (Sin cambios)
  // ========================================
  // ... [Aquí van todos los métodos existentes sin cambios: filterNavigationWithHierarchy, createNavigationSections, etc.]

  private onNavigationFiltered(filteredItems: INavData[]): void {
    this._filteredNavItems.next(filteredItems);
  }

  private onNavigationError(error: any): void {
    this.isProcessing = false;

    const publicItems = navItems.filter(item => !this.itemHasRoles(item));
    this._filteredNavItems.next(publicItems);
  }

  private filterNavigationWithHierarchy(items: INavData[]): Observable<INavData[]> {
    const sections = this.createNavigationSections(items);
    return this.processSectionsHierarchically(sections);
  }

  private createNavigationSections(items: INavData[]): NavigationSection[] {

    const sections: NavigationSection[] = [];
    let currentTitleIndex = -1;
    let currentTitle: INavData | null = null;
    let currentItems: INavData[] = [];
    let sectionStartIndex = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (this.isTitle(item)) {
        if (currentTitle !== null || currentItems.length > 0) {
          sections.push({
            title: currentTitle,
            items: [...currentItems],
            titleIndex: currentTitleIndex,
            startIndex: sectionStartIndex,
            endIndex: i - 1
          });
        }

        currentTitle = item;
        currentTitleIndex = i;
        currentItems = [];
        sectionStartIndex = i;
      } else {
        currentItems.push(item);
      }
    }

    if (currentTitle !== null || currentItems.length > 0) {
      sections.push({
        title: currentTitle,
        items: [...currentItems],
        titleIndex: currentTitleIndex,
        startIndex: sectionStartIndex,
        endIndex: items.length - 1
      });
    }

    this.logCreatedSections(sections);
    return sections;
  }

  private processSectionsHierarchically(sections: NavigationSection[]): Observable<INavData[]> {

    const sectionChecks = sections.map(section => this.processSingleSection(section));

    return forkJoin(sectionChecks).pipe(
      map(sectionResults => this.combineFilteredSections(sectionResults)),
      catchError(error => this.handleSectionProcessingError(error, sections))
    );
  }

  private processSingleSection(section: NavigationSection): Observable<SectionAccessResult> {

    if (!section.title) {
      return this.processItemsWithoutTitle(section);
    }

    return this.processSectionWithTitle(section);
  }

  private processItemsWithoutTitle(section: NavigationSection): Observable<SectionAccessResult> {

    return this.filterItemsByRoles(section.items, section.startIndex + 1).pipe(
      map(filteredItems => ({
        section,
        titleHasAccess: true,
        itemsWithAccess: filteredItems
      }))
    );
  }

  private processSectionWithTitle(section: NavigationSection): Observable<SectionAccessResult> {
    const titleName = section.title!.name;

    return this.checkTitleAccess(section.title!).pipe(
      switchMap(titleHasAccess => {

        if (!titleHasAccess) {
          return of({ section, titleHasAccess, itemsWithAccess: [] });
        }

        return this.filterItemsByRoles(section.items, section.startIndex + 1).pipe(
          map(filteredItems => ({
            section,
            titleHasAccess: true,
            itemsWithAccess: filteredItems
          }))
        );
      })
    );
  }

  private checkTitleAccess(title: INavData): Observable<boolean> {
    if (!this.itemHasRoles(title)) {
      return of(true);
    }

    const requiredRoles = this.extractItemRoles(title);

    return this._authService.hasRole(requiredRoles).pipe(
      catchError(error => {
        return of(false);
      })
    );
  }

  private filterItemsByRoles(items: INavData[], baseIndex: number): Observable<INavData[]> {
    if (items.length === 0) {
      return of([]);
    }

    const itemChecks = items.map((item, index) =>
      this.checkIndividualItemAccess(item, baseIndex + index)
    );

    return forkJoin(itemChecks).pipe(
      map(results => this.extractAccessibleItems(results)),
      catchError(error => {
        return of([]);
      })
    );
  }

  private checkIndividualItemAccess(item: INavData, originalIndex: number): Observable<ItemAccessResult> {
    if (!this.itemHasRoles(item)) {
      return of({ item, hasAccess: true, originalIndex });
    }

    const requiredRoles = this.extractItemRoles(item);

    return this._authService.hasRole(requiredRoles).pipe(
      map(hasAccess => {
        return { item, hasAccess, originalIndex };
      }),
      catchError(error => {
        return of({ item, hasAccess: false, originalIndex });
      })
    );
  }

  private extractAccessibleItems(results: ItemAccessResult[]): INavData[] {
    return results
      .filter(result => result.hasAccess)
      .map(result => result.item);
  }

  private combineFilteredSections(sectionResults: SectionAccessResult[]): INavData[] {

    const finalItems: INavData[] = [];

    for (const sectionResult of sectionResults) {
      if (!sectionResult.titleHasAccess) {
        continue;
      }

      if (sectionResult.section.title) {
        finalItems.push(sectionResult.section.title);
      }

      if (sectionResult.itemsWithAccess.length > 0) {
        finalItems.push(...sectionResult.itemsWithAccess);
      }
    }

    this.logFinalCombination(finalItems);
    return finalItems;
  }

  private handleSectionProcessingError(error: any, sections: NavigationSection[]): Observable<INavData[]> {
    this.isProcessing = false;

    const fallbackItems: INavData[] = [];
    sections.forEach(section => {
      if (section.title && !this.itemHasRoles(section.title)) {
        fallbackItems.push(section.title);
      }
      const itemsWithoutRoles = section.items.filter(item => !this.itemHasRoles(item));
      fallbackItems.push(...itemsWithoutRoles);
    });

    return of(fallbackItems);
  }

  // ========================================
  // MÉTODOS DE UTILIDAD
  // ========================================

  public getCurrentItems(): INavData[] {
    return this._filteredNavItems.value;
  }

  private isTitle(item: INavData): boolean {
    return item.title === true;
  }

  private itemHasRoles(item: INavData): boolean {
    return !!(item.attributes && item.attributes['roles']);
  }

  private extractItemRoles(item: INavData): Observable<RoleShared[]> {
    const requiredRolesNames = item.attributes!['roles'] as string[];
    return this.roleService.getRolesByNames(requiredRolesNames);
  }

  // ========================================
  // LOGGING MEJORADO CON INFORMACIÓN DE CACHE
  // ========================================

  private logFilteredItems(items: INavData[]): void {

    const cacheInfo = this.getCacheInfo();
    if (cacheInfo.hasCache) {
      console.log('💾 Cache info:', {
        age: cacheInfo.age + ' minutes',
        valid: cacheInfo.isValid,
        itemCount: cacheInfo.itemCount
      });
    }

    items.forEach((item, index) => {
      const type = item.title ? '👑 TITLE' : '📄 ITEM';
      console.log(`  ${index + 1}. ${type}: ${item.name}`);
    });
  }

  private logCreatedSections(sections: NavigationSection[]): void {

    sections.forEach((section, index) => {
      const titleName = section.title?.name || 'NO TITLE';
      const titleRoles = section.title?.attributes?.['roles'] || 'NO ROLES';
    });
  }

  private logFinalCombination(finalItems: INavData[]): void {

    const currentTime = new Date().toLocaleTimeString();

    const cacheInfo = this.getCacheInfo();
  }

  // ========================================
  // MÉTODO DE DEBUG MEJORADO
  // ========================================

  /**
   * Debug del estado del servicio incluyendo información de cache
   */
  public debugState(): void {
    const cacheInfo = this.getCacheInfo();
    const currentItems = this.getCurrentItems();

    console.log('🐛 NavigationService State Debug:');
    console.log('  📊 Current Items:', currentItems.length);
    console.log('  🔄 Is Processing:', this.isProcessing);
    console.log('  💾 Cache Info:', cacheInfo);
    console.log('  🕐 Current Time:', new Date().toLocaleTimeString());

    if (cacheInfo.hasCache) {
      console.log('  📋 Cache Details:');
      console.log('    👤 User ID:', cacheInfo.userId);
      console.log('    ⏰ Age:', cacheInfo.age, 'minutes');
      console.log('    ✅ Valid:', cacheInfo.isValid);
      console.log('    📄 Items:', cacheInfo.itemCount);
    }
  }
}
