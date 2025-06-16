import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '@environments/environment';
import { StorageService } from '@shared/service/storage.service';
import { map, Observable, of, share, tap, catchError, switchMap } from 'rxjs';

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

  // Corregir sintaxis del signal
  private _roles = signal<RoleShared[]>([]);
  public roles = this._roles.asReadonly();

  // ========================================
  // MÉTODOS PRINCIPALES DE OBTENCIÓN DE DATOS
  // ========================================

  /**
   * Obtener datos con estrategia inteligente (cache-first por defecto)
   */
  getData(strategy: DataStrategy = DataStrategy.CACHE_FIRST): Observable<RoleShared[]> {
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

  /**
   * Estrategia Cache-First: Usar cache si existe, sino API
   */
  private getDataCacheFirst(): Observable<RoleShared[]> {
    return this.getDataLocal().pipe(
      switchMap(cachedData => {
        if (this.isCacheValid(cachedData)) {
          console.log('🎯 Using cached roles data');
          return of(cachedData);
        } else {
          console.log('📡 Cache invalid/empty, fetching from API');
          return this.getDataApiOnly();
        }
      })
    );
  }

  /**
   * Estrategia API-First: Usar API, cache como fallback
   */
  private getDataApiFirst(): Observable<RoleShared[]> {
    return this.getDataApiOnly().pipe(
      catchError(error => {
        console.warn('⚠️ API failed, falling back to cache:', error);
        return this.getDataCacheOnly();
      })
    );
  }

  /**
   * Obtener datos solo del cache local
   */
  getDataLocal(): Observable<RoleShared[]> {
    console.log('🗄️ Loading roles from cache');

    const localData = this.storage.get(this.localStorageKeyShared);
    const items = localData ? JSON.parse(localData) : [];

    this.updateInternalState(items);
    return of(items);
  }

  /**
   * Obtener datos solo del cache (alias para claridad)
   */
  private getDataCacheOnly(): Observable<RoleShared[]> {
    return this.getDataLocal();
  }

  /**
   * Obtener datos solo de la API
   */
  getDataApi(): Observable<RoleShared[]> {
    console.log('📡 Fetching roles from API');
    const url = `${this.urlApi}/shared`;

    return this.httpClient.get<{ items: RoleShared[] }>(url).pipe(
      map(response => this.extractItemsFromResponse(response)),
      tap(items => this.saveToCache(items)),
      tap(items => this.updateInternalState(items)),
      share(),
      catchError(error => this.handleApiError(error))
    );
  }

  /**
   * Obtener datos solo de la API (alias para claridad)
   */
  private getDataApiOnly(): Observable<RoleShared[]> {
    return this.getDataApi();
  }

  // ========================================
  // MÉTODOS DE VERIFICACIÓN DE EXISTENCIA (Cache-optimized)
  // ========================================

  /**
   * Verificar si existe un rol por nombre
   */
  existRoleByName(name: string): Observable<boolean> {
    return this.getData().pipe(
      map(roles => this.checkRoleExistsByName(roles, name))
    );
  }

  /**
   * Verificar si existen todos los roles en un array de nombres
   */
  existRoleByNameArray(names: string[]): Observable<boolean> {
    return this.getData().pipe(
      map(roles => this.checkAllRolesExistByNames(roles, names))
    );
  }

  /**
   * Verificar si existe un rol por ID
   */
  existRoleById(id: string): Observable<boolean> {
    return this.getData().pipe(
      map(roles => this.checkRoleExistsById(roles, id))
    );
  }

  // ========================================
  // MÉTODOS DE BÚSQUEDA (Cache-optimized)
  // ========================================

  /**
   * Obtener rol por ID
   */
  getRoleById(id: string): Observable<RoleShared | undefined> {
    return this.getData().pipe(
      map(roles => this.findRoleById(roles, id))
    );
  }

  /**
   * Obtener rol por nombre
   */
  getRoleByName(name: string): Observable<RoleShared | undefined> {
    return this.getData().pipe(
      map(roles => this.findRoleByName(roles, name))
    );
  }

  /**
   * Obtener roles por array de nombres
   */
  getRolesByNames(names: string[]): Observable<RoleShared[]> {
    return this.getData().pipe(
      map(roles => this.filterRolesByNames(roles, names)),
      tap(filteredRoles => this.logRoleSearch('names', names, filteredRoles))
    );
  }

  /**
   * Obtener roles por array de IDs
   */
  getRolesByIds(ids: string[]): Observable<RoleShared[]> {
    return this.getData().pipe(
      map(roles => this.filterRolesByIds(roles, ids)),
      tap(filteredRoles => this.logRoleSearch('IDs', ids, filteredRoles))
    );
  }

  // ========================================
  // MÉTODOS DE UTILIDAD PARA BÚSQUEDA
  // ========================================

  /**
   * Verificar si un rol existe por nombre
   */
  private checkRoleExistsByName(roles: RoleShared[], name: string): boolean {
    return roles.some(role => role.name === name);
  }

  /**
   * Verificar si todos los roles existen por nombres
   */
  private checkAllRolesExistByNames(roles: RoleShared[], names: string[]): boolean {
    return names.every(name =>
      roles.some(role => role.name === name)
    );
  }

  /**
   * Verificar si un rol existe por ID
   */
  private checkRoleExistsById(roles: RoleShared[], id: string): boolean {
    return roles.some(role => role.id === id);
  }

  /**
   * Encontrar rol por ID
   */
  private findRoleById(roles: RoleShared[], id: string): RoleShared | undefined {
    return roles.find(role => role.id === id);
  }

  /**
   * Encontrar rol por nombre
   */
  private findRoleByName(roles: RoleShared[], name: string): RoleShared | undefined {
    return roles.find(role => role.name === name);
  }

  /**
   * Filtrar roles por nombres
   */
  private filterRolesByNames(roles: RoleShared[], names: string[]): RoleShared[] {
    return roles.filter(role => names.includes(role.name));
  }

  /**
   * Filtrar roles por IDs
   */
  private filterRolesByIds(roles: RoleShared[], ids: string[]): RoleShared[] {
    return roles.filter(role => ids.includes(role.id));
  }

  // ========================================
  // MÉTODOS DE GESTIÓN DE CACHE
  // ========================================

  /**
   * Verificar si el cache es válido
   */
  private isCacheValid(cachedData: RoleShared[]): boolean {
    if (!cachedData || cachedData.length === 0) {
      return false;
    }

    // Verificar si el cache no ha expirado
    const cacheTimestamp = this.storage.get(`${this.localStorageKeyShared}_timestamp`);
    if (!cacheTimestamp) {
      return false;
    }

    const cacheAge = Date.now() - parseInt(cacheTimestamp);
    const maxAge = this.cacheExpirationMinutes * 60 * 1000; // Convertir a milisegundos

    return cacheAge < maxAge;
  }

  /**
   * Guardar datos en cache con timestamp
   */
  private saveToCache(items: RoleShared[]): void {
    console.log('💾 Saving', items.length, 'roles to cache');

    this.storage.set(this.localStorageKeyShared, JSON.stringify(items), this.cacheExpirationMinutes);
    this.storage.set(`${this.localStorageKeyShared}_timestamp`, Date.now().toString());
  }

  /**
   * Actualizar estado interno del signal
   */
  private updateInternalState(items: RoleShared[]): void {
    this._roles.set(items);
  }

  // ========================================
  // MÉTODOS DE UTILIDAD Y PROCESAMIENTO
  // ========================================

  /**
   * Extraer items de la respuesta de la API
   */
  private extractItemsFromResponse(response: { items: RoleShared[] }): RoleShared[] {
    return response.items || [];
  }

  /**
   * Manejar errores de la API
   */
  private handleApiError(error: any): Observable<RoleShared[]> {
    console.error('❌ Error fetching roles from API:', error);
    return this.getDataLocal(); // Fallback al cache
  }

  /**
   * Log de búsquedas de roles
   */
  private logRoleSearch(searchType: string, searchValues: string[], results: RoleShared[]): void {
    console.log(`🔍 Role search by ${searchType}:`, searchValues, '→ Found:', results.length, 'roles');
  }

  // ========================================
  // MÉTODOS PÚBLICOS DE GESTIÓN
  // ========================================

  /**
   * Limpiar datos del cache y estado interno
   */
  clearData(): void {
    console.log('🗑️ Clearing roles data and cache');
    this._roles.set([]);
    this.storage.remove(this.localStorageKeyShared);
    this.storage.remove(`${this.localStorageKeyShared}_timestamp`);
  }

  /**
   * Refrescar datos forzando llamada a la API
   */
  refreshData(): Observable<RoleShared[]> {
    console.log('🔄 Forcing data refresh from API');
    return this.getDataApiOnly();
  }

  /**
   * Verificar estado del cache
   */
  getCacheStatus(): { hasCache: boolean; isValid: boolean; itemCount: number } {
    const cachedData = this.storage.get(this.localStorageKeyShared);
    const items = cachedData ? JSON.parse(cachedData) : [];

    return {
      hasCache: !!cachedData,
      isValid: this.isCacheValid(items),
      itemCount: items.length
    };
  }
}
