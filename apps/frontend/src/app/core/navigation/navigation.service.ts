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
  // CONSTRUCTOR - Configuración reactiva
  // ========================================
  constructor(private _authService: AuthService) {
    this.setupReactiveNavigation();
  }

  // ========================================
  // LIMPIEZA DE RECURSOS
  // ========================================
  ngOnDestroy(): void {
    console.log('🧹 NavigationService cleanup');
    this.subscriptions.unsubscribe();
  }

  // ========================================
  // GETTER PÚBLICO
  // ========================================
  get filteredNavItems$(): Observable<INavData[]> {
    return this._filteredNavItems.asObservable().pipe(
      distinctUntilChanged(), // Evitar emisiones duplicadas
      tap(items => this.logFilteredItems(items))
    );
  }

  // ========================================
  // CONFIGURACIÓN REACTIVA
  // ========================================

  /**
   * Configurar navegación reactiva que responde a cambios de autenticación
   */
  private setupReactiveNavigation(): void {
    console.log('🔧 Setting up reactive navigation');

    // Combinar múltiples triggers para actualización
    const navigationTriggers$ = combineLatest([
      this._authService.isAuthenticated$,
      this._authService.currentUser$
    ]).pipe(
      debounceTime(100), // Evitar múltiples actualizaciones rápidas
      distinctUntilChanged(([prevAuth, prevUser], [currAuth, currUser]) => {
        // Solo actualizar si realmente cambió algo relevante
        const authChanged = prevAuth !== currAuth;
        const userChanged = (prevUser?.id || null) !== (currUser?.id || null);
        return !authChanged && !userChanged;
      }),
      tap(([isAuthenticated, user]) => {
        console.log('🔄 Navigation trigger:', {
          isAuthenticated,
          userId: user?.id || 'none',
          userName: user?.username || 'none'
        });
      })
    );

    // Suscribirse a cambios y actualizar navegación
    const subscription = navigationTriggers$.subscribe(
      ([isAuthenticated, user]) => {
        if (isAuthenticated && user) {
          console.log('✅ User authenticated, refreshing navigation for:', user.username);
          this.refreshNavigationForUser(user);
        } else {
          console.log('❌ User not authenticated, clearing navigation');
          this.clearNavigation();
        }
      }
    );

    this.subscriptions.add(subscription);
  }

  /**
   * Refrescar navegación para un usuario específico
   */
  private refreshNavigationForUser(user: any): void {
    if (this.isProcessing) {
      console.log('⏳ Navigation refresh already in progress, skipping');
      return;
    }

    console.log('🚀 Refreshing navigation for user:', user.username);
    this.isProcessing = true;

    // Limpiar cache de roles antes de procesar
    this.clearRolesCaches();

    // Inicializar navegación
    this.initializeNavigation();
  }

  /**
   * Limpiar navegación cuando no hay usuario autenticado
   */
  private clearNavigation(): void {
    console.log('🧹 Clearing navigation - no authenticated user');
    this.clearRolesCaches();
    this._filteredNavItems.next([]);
  }

  /**
   * Limpiar todos los caches relacionados con roles
   */
  private clearRolesCaches(): void {
    console.log('🗑️ Clearing roles caches');

    // Limpiar cache del RoleSharedService
    if (this.roleService.clearData) {
      this.roleService.clearData();
    }

    // Limpiar cache de roles del usuario en AuthService
    if (this._authService.refreshUserRoles) {
      this._authService.refreshUserRoles().subscribe();
    }
  }

  // ========================================
  // MÉTODOS PÚBLICOS
  // ========================================

  /**
   * Refrescar navegación manualmente
   */
  public refreshNavigation(): void {
    console.log('🔄 Manual navigation refresh triggered');

    this._authService.currentUser$.pipe(
      filter(user => !!user),
      take(1)
    ).subscribe(user => {
      this.refreshNavigationForUser(user);
    });
  }

  /**
   * Obtener estado actual de los items
   */
  public getCurrentItems(): INavData[] {
    return this._filteredNavItems.value;
  }

  /**
   * Forzar limpieza completa y reinicialización
   */
  public forceRefresh(): void {
    console.log('💪 Force refresh triggered');
    this.isProcessing = false;
    this.clearRolesCaches();

    setTimeout(() => {
      this.refreshNavigation();
    }, 100);
  }

  // ========================================
  // INICIALIZACIÓN (Mejorada)
  // ========================================

  /**
   * Inicializar navegación con verificación de usuario
   */
  private initializeNavigation(): void {
    console.log('🚀 Initializing hierarchical navigation...');

    // Verificar que hay un usuario autenticado antes de procesar
    this._authService.isAuthenticated$.pipe(
      filter(isAuth => isAuth === true),
      take(1),
      switchMap(() => {
        console.log('👤 User confirmed authenticated, proceeding with navigation filtering');
        return this.filterNavigationWithHierarchy(navItems);
      })
    ).subscribe({
      next: (filteredItems) => this.onNavigationFiltered(filteredItems),
      error: (error) => this.onNavigationError(error),
      complete: () => {
        this.isProcessing = false;
        console.log('✅ Navigation initialization completed');
      }
    });
  }

  private onNavigationFiltered(filteredItems: INavData[]): void {
    console.log('✅ Hierarchical navigation filtered successfully:', filteredItems.length, 'items');
    this._filteredNavItems.next(filteredItems);
  }

  private onNavigationError(error: any): void {
    console.error('❌ Error filtering hierarchical navigation:', error);
    this.isProcessing = false;

    // En caso de error, mostrar solo items públicos
    const publicItems = navItems.filter(item => !this.itemHasRoles(item));
    this._filteredNavItems.next(publicItems);
  }

  // ========================================
  // FILTRADO JERÁRQUICO PRINCIPAL (Sin cambios)
  // ========================================

  private filterNavigationWithHierarchy(items: INavData[]): Observable<INavData[]> {
    console.log('🏗️ Starting hierarchical filtering for', items.length, 'items');
    const sections = this.createNavigationSections(items);
    return this.processSectionsHierarchically(sections);
  }

  private createNavigationSections(items: INavData[]): NavigationSection[] {
    console.log('📑 Creating navigation sections...');

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
    console.log('🎯 Processing', sections.length, 'sections hierarchically');

    const sectionChecks = sections.map(section => this.processSingleSection(section));

    return forkJoin(sectionChecks).pipe(
      map(sectionResults => this.combineFilteredSections(sectionResults)),
      catchError(error => this.handleSectionProcessingError(error, sections))
    );
  }

  private processSingleSection(section: NavigationSection): Observable<SectionAccessResult> {
    console.log(`📂 Processing section: "${section.title?.name || 'No Title'}" with ${section.items.length} items`);

    if (!section.title) {
      return this.processItemsWithoutTitle(section);
    }

    return this.processSectionWithTitle(section);
  }

  private processItemsWithoutTitle(section: NavigationSection): Observable<SectionAccessResult> {
    console.log('📄 Processing section without title');

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
    console.log(`👑 Processing section with title: "${titleName}"`);

    return this.checkTitleAccess(section.title!).pipe(
      switchMap(titleHasAccess => {
        console.log(`👑 Title "${titleName}" access: ${titleHasAccess}`);

        if (!titleHasAccess) {
          console.log(`🚫 Section "${titleName}" blocked by title access`);
          return of({ section, titleHasAccess, itemsWithAccess: [] });
        }

        console.log(`✅ Section "${titleName}" accessible, checking individual items`);
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

  // ========================================
  // RESTO DE MÉTODOS (Sin cambios significativos)
  // ========================================

  private checkTitleAccess(title: INavData): Observable<boolean> {
    if (!this.itemHasRoles(title)) {
      console.log(`👑 Title "${title.name}" has no roles, allowing access`);
      return of(true);
    }

    console.log(`🔐 Checking roles for title: "${title.name}"`);
    const requiredRoles = this.extractItemRoles(title);

    return this._authService.hasRole(requiredRoles).pipe(
      tap(hasAccess => console.log(`👑 Title "${title.name}" role check result: ${hasAccess}`)),
      catchError(error => {
        console.error(`❌ Error checking title access for "${title.name}":`, error);
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
        console.error('❌ Error filtering items by roles:', error);
        return of([]);
      })
    );
  }

  private checkIndividualItemAccess(item: INavData, originalIndex: number): Observable<ItemAccessResult> {
    if (!this.itemHasRoles(item)) {
      console.log(`📄 Item "${item.name}" has no roles, allowing access`);
      return of({ item, hasAccess: true, originalIndex });
    }

    console.log(`🔐 Checking roles for item: "${item.name}"`);
    const requiredRoles = this.extractItemRoles(item);

    return this._authService.hasRole(requiredRoles).pipe(
      map(hasAccess => {
        console.log(`📄 Item "${item.name}" role check result: ${hasAccess}`);
        return { item, hasAccess, originalIndex };
      }),
      catchError(error => {
        console.error(`❌ Error checking access for item "${item.name}":`, error);
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
    console.log('🎯 Combining filtered sections...');

    const finalItems: INavData[] = [];

    for (const sectionResult of sectionResults) {
      if (!sectionResult.titleHasAccess) {
        console.log(`🚫 Skipping section "${sectionResult.section.title?.name}" - no title access`);
        continue;
      }

      if (sectionResult.section.title) {
        console.log(`👑 Adding title: "${sectionResult.section.title.name}"`);
        finalItems.push(sectionResult.section.title);
      }

      if (sectionResult.itemsWithAccess.length > 0) {
        console.log(`📄 Adding ${sectionResult.itemsWithAccess.length} accessible items`);
        finalItems.push(...sectionResult.itemsWithAccess);
      }
    }

    this.logFinalCombination(finalItems);
    return finalItems;
  }

  private handleSectionProcessingError(error: any, sections: NavigationSection[]): Observable<INavData[]> {
    console.error('❌ Error processing sections:', error);
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
  // LOGGING (Mejorado)
  // ========================================

  private logFilteredItems(items: INavData[]): void {
    console.log('📤 Hierarchical filtered items emitted:', items.length, 'items');

    // Solo mostrar detalles si hay cambios significativos
    const currentUser = this._authService.currentUser$ ? 'authenticated' : 'none';
    console.log(`📤 For user: ${currentUser}`);

    items.forEach((item, index) => {
      const type = item.title ? '👑 TITLE' : '📄 ITEM';
      console.log(`  ${index + 1}. ${type}: ${item.name}`);
    });
  }

  private logCreatedSections(sections: NavigationSection[]): void {
    console.log('📑 Created', sections.length, 'navigation sections:');

    sections.forEach((section, index) => {
      const titleName = section.title?.name || 'NO TITLE';
      const titleRoles = section.title?.attributes?.['roles'] || 'NO ROLES';
      console.log(`  ${index + 1}. "${titleName}" (${titleRoles}) → ${section.items.length} items`);
    });
  }

  private logFinalCombination(finalItems: INavData[]): void {
    console.log('🎯 Final hierarchical navigation structure:');
    console.log(`📊 Total items: ${finalItems.length}`);

    const currentTime = new Date().toLocaleTimeString();
    console.log(`🕐 Generated at: ${currentTime}`);
  }
}
