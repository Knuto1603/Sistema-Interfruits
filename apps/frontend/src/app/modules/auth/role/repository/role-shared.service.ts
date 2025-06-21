import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '@environments/environment';
import { StorageService } from '@shared/service/storage.service';
import {
  map,
  Observable,
  of,
  share,
  tap,
  catchError,
  switchMap,
  BehaviorSubject,
  shareReplay,
  timer,
  EMPTY,
  finalize
} from 'rxjs';

import { RoleShared } from '../interface/role.interface';

/**
 * Estrategias de obtención de datos
 */
enum DataStrategy {
  CACHE_FIRST = 'cache_first',     // Primero cache, luego API si no hay datos
  API_FIRST = 'api_first',         // Primero API, cache como fallback
  CACHE_ONLY = 'cache_only',       // Solo cache
  API_ONLY = 'api_only'            // Solo API
}

/**
 * Estado del cache en memoria
 */
interface CacheState {
  data: RoleShared[];
  timestamp: number;
  isLoading: boolean;
  hasError: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class RoleSharedService {
  // ========================================
  // PROPIEDADES PRIVADAS
  // ========================================
  private readonly urlApi: string = `${environment.apiSecurity}/api/user_roles`;
  private readonly localStorageKeyShared = 'roles-shared';
  private readonly cacheExpirationMinutes = 10; // 10 minutos por defecto

  private httpClient: HttpClient = inject(HttpClient);
  private storage: StorageService = inject(StorageService);

  // Signal para UI reactiva
  private _roles = signal<RoleShared[]>([]);
  public roles = this._roles.asReadonly();

  // ========================================
  // CACHE EN MEMORIA - SOLUCIÓN PRINCIPAL
  // ========================================
  private _cacheState = new BehaviorSubject<CacheState>({
    data: [],
    timestamp: 0,
    isLoading: false,
    hasError: false
  });

  // Observable compartido para evitar múltiples peticiones simultáneas
  private _sharedDataRequest$: Observable<RoleShared[]> | null = null;

  // ========================================
  // OBSERVABLES PÚBLICOS
  // ========================================
  public readonly cacheState$ = this._cacheState.asObservable();
  public readonly isLoading$ = this.cacheState$.pipe(map(state => state.isLoading));
  public readonly hasError$ = this.cacheState$.pipe(map(state => state.hasError));

  // ========================================
  // INICIALIZACIÓN
  // ========================================
  constructor() {
    this.initializeCache();
  }

  /**
   * Inicializar cache desde localStorage
   */
  private initializeCache(): void {
    console.log('🚀 Initializing RoleSharedService cache...');

    try {
      const cachedData = this.readFromStorage();
      const timestamp = this.getCacheTimestamp();

      if (cachedData.length > 0) {
        console.log('💾 Found cached roles:', cachedData.length, 'items');
        this.updateMemoryCache(cachedData, timestamp, false, false);
      } else {
        console.log('📝 No cached roles found, cache empty');
      }
    } catch (error) {
      console.error('❌ Error initializing cache:', error);
    }
  }

  // ========================================
  // MÉTODO PRINCIPAL - OPTIMIZADO
  // ========================================

  /**
   * Obtener datos con estrategia inteligente y cache en memoria
   */
  getData(strategy: DataStrategy = DataStrategy.CACHE_FIRST): Observable<RoleShared[]> {
    console.log(`🔍 Getting data with strategy: ${strategy}`);

    // Primero verificar cache en memoria
    const currentState = this._cacheState.value;

    // Si hay una petición en curso, compartirla
    if (currentState.isLoading && this._sharedDataRequest$) {
      console.log('⏳ Request in progress, sharing existing request');
      return this._sharedDataRequest$;
    }

    switch (strategy) {
      case DataStrategy.CACHE_FIRST:
        return this.getDataCacheFirst();
      case DataStrategy.API_FIRST:
        return this.getDataApiFirst();
      case DataStrategy.CACHE_ONLY:
        return this.getDataCacheOnly();
      case DataStrategy.API_ONLY:
        return this.getDataApiOnly();
      default:
        return this.getDataCacheFirst();
    }
  }

  // ========================================
  // ESTRATEGIAS OPTIMIZADAS
  // ========================================

  /**
   * Estrategia Cache-First: Optimizada con cache en memoria
   */
  private getDataCacheFirst(): Observable<RoleShared[]> {
    const currentState = this._cacheState.value;

    // Si hay datos válidos en memoria, usarlos inmediatamente
    if (this.isMemoryCacheValid(currentState)) {
      console.log('🎯 Using valid memory cache');
      return of(currentState.data);
    }

    // Si no hay datos en memoria, intentar localStorage
    return this.loadFromStorageIfValid().pipe(
      switchMap(storageData => {
        if (storageData.length > 0) {
          console.log('💾 Using valid storage cache');
          this.updateMemoryCache(storageData, Date.now(), false, false);
          return of(storageData);
        } else {
          console.log('📡 No valid cache, fetching from API');
          return this.fetchFromApiWithSharing();
        }
      })
    );
  }

  /**
   * Estrategia API-First: Usar API, cache como fallback
   */
  private getDataApiFirst(): Observable<RoleShared[]> {
    return this.fetchFromApiWithSharing().pipe(
      catchError(error => {
        console.warn('⚠️ API failed, falling back to cache:', error);
        return this.getDataCacheOnly();
      })
    );
  }

  /**
   * Obtener datos solo del cache
   */
  private getDataCacheOnly(): Observable<RoleShared[]> {
    const currentState = this._cacheState.value;

    // Primero intentar memoria
    if (currentState.data.length > 0) {
      console.log('🎯 Using memory cache for cache-only request');
      return of(currentState.data);
    }

    // Luego intentar storage
    return this.loadFromStorageIfValid().pipe(
      tap(storageData => {
        if (storageData.length > 0) {
          console.log('💾 Loading cache-only from storage');
          this.updateMemoryCache(storageData, Date.now(), false, false);
        }
      })
    );
  }

  /**
   * Obtener datos solo de la API
   */
  private getDataApiOnly(): Observable<RoleShared[]> {
    return this.fetchFromApiWithSharing();
  }

  // ========================================
  // OPTIMIZACIONES DE CACHE
  // ========================================

  /**
   * Verificar si el cache en memoria es válido
   */
  private isMemoryCacheValid(state: CacheState): boolean {
    if (state.data.length === 0 || state.hasError) {
      return false;
    }

    const cacheAge = Date.now() - state.timestamp;
    const maxAge = this.cacheExpirationMinutes * 60 * 1000;

    const isValid = cacheAge < maxAge;

    if (!isValid) {
      console.log('⏰ Memory cache expired, age:', Math.round(cacheAge / 1000), 'seconds');
    }

    return isValid;
  }

  /**
   * Cargar desde storage si es válido
   */
  private loadFromStorageIfValid(): Observable<RoleShared[]> {
    try {
      const cachedData = this.readFromStorage();
      const timestamp = this.getCacheTimestamp();

      if (cachedData.length > 0 && this.isStorageCacheValid(timestamp)) {
        return of(cachedData);
      } else {
        console.log('💾 Storage cache invalid or empty');
        return of([]);
      }
    } catch (error) {
      console.error('❌ Error reading from storage:', error);
      return of([]);
    }
  }

  /**
   * Verificar si el cache de storage es válido
   */
  private isStorageCacheValid(timestamp: number): boolean {
    if (!timestamp) return false;

    const cacheAge = Date.now() - timestamp;
    const maxAge = this.cacheExpirationMinutes * 60 * 1000;

    return cacheAge < maxAge;
  }

  /**
   * Fetch con compartición de peticiones - CLAVE PARA EVITAR DUPLICADOS
   */
  private fetchFromApiWithSharing(): Observable<RoleShared[]> {
    // Si ya hay una petición en curso, compartirla
    if (this._sharedDataRequest$) {
      console.log('🔄 Sharing existing API request');
      return this._sharedDataRequest$;
    }

    console.log('📡 Creating new API request');

    // Marcar como loading
    this.updateLoadingState(true);

    // Crear petición compartida
    this._sharedDataRequest$ = this.performApiRequest().pipe(
      tap(items => {
        console.log('✅ API request successful:', items.length, 'roles');
        this.updateMemoryCache(items, Date.now(), false, false);
        this.saveToStorage(items);
      }),
      catchError(error => {
        console.error('❌ API request failed:', error);
        this.updateMemoryCache([], 0, false, true);
        throw error;
      }),
      finalize(() => {
        console.log('🏁 API request completed, clearing shared request');
        this._sharedDataRequest$ = null;
        this.updateLoadingState(false);
      }),
      shareReplay(1) // Compartir resultado con todos los suscriptores
    );

    return this._sharedDataRequest$;
  }

  /**
   * Realizar petición HTTP real
   */
  private performApiRequest(): Observable<RoleShared[]> {
    const url = `${this.urlApi}/shared`;

    return this.httpClient.get<{ items: RoleShared[] }>(url).pipe(
      map(response => response.items || []),
      share()
    );
  }

  // ========================================
  // GESTIÓN DE ESTADO DE CACHE
  // ========================================

  /**
   * Actualizar cache en memoria
   */
  private updateMemoryCache(
    data: RoleShared[],
    timestamp: number,
    isLoading: boolean,
    hasError: boolean
  ): void {
    this._cacheState.next({
      data,
      timestamp,
      isLoading,
      hasError
    });

    // Actualizar signal para UI reactiva
    this._roles.set(data);
  }

  /**
   * Actualizar solo el estado de loading
   */
  private updateLoadingState(isLoading: boolean): void {
    const currentState = this._cacheState.value;
    this._cacheState.next({
      ...currentState,
      isLoading
    });
  }

  // ========================================
  // OPERACIONES DE STORAGE OPTIMIZADAS
  // ========================================

  /**
   * Leer datos del storage
   */
  private readFromStorage(): RoleShared[] {
    try {
      const data = this.storage.get(this.localStorageKeyShared);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('❌ Error reading from storage:', error);
      return [];
    }
  }

  /**
   * Obtener timestamp del cache
   */
  private getCacheTimestamp(): number {
    try {
      const timestamp = this.storage.get(`${this.localStorageKeyShared}_timestamp`);
      return timestamp ? parseInt(timestamp) : 0;
    } catch (error) {
      console.error('❌ Error reading timestamp:', error);
      return 0;
    }
  }

  /**
   * Guardar datos en storage
   */
  private saveToStorage(items: RoleShared[]): void {
    try {
      console.log('💾 Saving', items.length, 'roles to storage');
      this.storage.set(this.localStorageKeyShared, JSON.stringify(items), this.cacheExpirationMinutes);
      this.storage.set(`${this.localStorageKeyShared}_timestamp`, Date.now().toString());
    } catch (error) {
      console.error('❌ Error saving to storage:', error);
    }
  }

  // ========================================
  // MÉTODOS DE BÚSQUEDA OPTIMIZADOS
  // ========================================

  /**
   * Obtener roles por array de nombres - OPTIMIZADO
   */
  getRolesByNames(names: string[]): Observable<RoleShared[]> {
    if (!names || names.length === 0) {
      return of([]);
    }

    return this.getData().pipe(
      map(roles => this.filterRolesByNames(roles, names)),
      tap(filteredRoles => this.logRoleSearch('names', names, filteredRoles))
    );
  }

  /**
   * Obtener roles por array de IDs - OPTIMIZADO
   */
  getRolesByIds(ids: string[]): Observable<RoleShared[]> {
    if (!ids || ids.length === 0) {
      return of([]);
    }

    return this.getData().pipe(
      map(roles => this.filterRolesByIds(roles, ids)),
      tap(filteredRoles => this.logRoleSearch('IDs', ids, filteredRoles))
    );
  }

  /**
   * Verificar si existe un rol por nombre - OPTIMIZADO
   */
  existRoleByName(name: string): Observable<boolean> {
    return this.getData().pipe(
      map(roles => roles.some(role => role.name === name))
    );
  }

  /**
   * Obtener rol por nombre - OPTIMIZADO
   */
  getRoleByName(name: string): Observable<RoleShared | undefined> {
    return this.getData().pipe(
      map(roles => roles.find(role => role.name === name))
    );
  }

  // ========================================
  // MÉTODOS DE UTILIDAD PARA BÚSQUEDA
  // ========================================

  private filterRolesByNames(roles: RoleShared[], names: string[]): RoleShared[] {
    return roles.filter(role => names.includes(role.name));
  }

  private filterRolesByIds(roles: RoleShared[], ids: string[]): RoleShared[] {
    return roles.filter(role => ids.includes(role.id));
  }

  private logRoleSearch(searchType: string, searchValues: string[], results: RoleShared[]): void {
    console.log(`🔍 Role search by ${searchType}:`, searchValues, '→ Found:', results.length, 'roles');
  }

  // ========================================
  // MÉTODOS PÚBLICOS DE GESTIÓN
  // ========================================

  /**
   * Limpiar datos del cache y estado interno - MEJORADO
   */
  clearData(): void {
    console.log('🗑️ Clearing all roles data and cache');

    // Limpiar memoria
    this.updateMemoryCache([], 0, false, false);

    // Limpiar storage
    this.storage.remove(this.localStorageKeyShared);
    this.storage.remove(`${this.localStorageKeyShared}_timestamp`);

    // Cancelar petición en curso si existe
    this._sharedDataRequest$ = null;
  }

  /**
   * Refrescar datos forzando llamada a la API - MEJORADO
   */
  refreshData(): Observable<RoleShared[]> {
    console.log('🔄 Forcing data refresh from API');

    // Cancelar petición en curso
    this._sharedDataRequest$ = null;

    // Forzar recarga desde API
    return this.getDataApiOnly();
  }

  /**
   * Verificar estado del cache - MEJORADO
   */
  getCacheStatus(): {
    memoryCache: { hasData: boolean; isValid: boolean; itemCount: number; isLoading: boolean };
    storageCache: { hasData: boolean; isValid: boolean; itemCount: number };
  } {
    const memoryState = this._cacheState.value;
    const storageData = this.readFromStorage();
    const storageTimestamp = this.getCacheTimestamp();

    return {
      memoryCache: {
        hasData: memoryState.data.length > 0,
        isValid: this.isMemoryCacheValid(memoryState),
        itemCount: memoryState.data.length,
        isLoading: memoryState.isLoading
      },
      storageCache: {
        hasData: storageData.length > 0,
        isValid: this.isStorageCacheValid(storageTimestamp),
        itemCount: storageData.length
      }
    };
  }

  /**
   * Precargar datos en background
   */
  preloadData(): void {
    console.log('⚡ Preloading roles data in background');
    this.getData().subscribe({
      next: (roles) => console.log('⚡ Preload completed:', roles.length, 'roles'),
      error: (error) => console.error('⚡ Preload failed:', error)
    });
  }

  /**
   * Debug del estado actual
   */
  debugState(): void {
    const status = this.getCacheStatus();
    console.log('🐛 RoleSharedService State Debug:');
    console.log('  🧠 Memory Cache:', status.memoryCache);
    console.log('  💾 Storage Cache:', status.storageCache);
    console.log('  📡 Active Request:', !!this._sharedDataRequest$);
    console.log('  🔄 Current Signal Value:', this._roles().length, 'roles');
  }
}
