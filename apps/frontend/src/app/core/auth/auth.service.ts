import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { AuthUtils } from './auth.utils';
import { UserService } from '../user/user.service';
import {
  catchError,
  combineLatest,
  map,
  Observable,
  of,
  switchMap,
  take,
  tap,
  throwError,
  BehaviorSubject,
  shareReplay,
  filter
} from 'rxjs';
import { User } from '../user/user.types';
import { environment } from "@environments/environment";
import { RoleSharedService } from "@modules/auth/role/repository/role-shared.service";
import { RoleShared } from "@modules/auth/role/interface/role.interface";

/**
 * Interfaces para mejor tipado
 */
interface SignInCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

interface RoleVerificationResult {
  hasRole: boolean;
  userRoles: RoleShared[];
  allowedRoles: RoleShared[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  // ========================================
  // PROPIEDADES PRIVADAS - REACTIVAS
  // ========================================
  private _authenticated = new BehaviorSubject<boolean>(false);
  private _isInitialized = new BehaviorSubject<boolean>(false);
  private _currentUser = new BehaviorSubject<User | null>(null); // ← NUEVO: Usuario actual reactivo
  private httpClient: HttpClient = inject(HttpClient);
  private userService: UserService = inject(UserService);
  private rolesShared: RoleSharedService = inject(RoleSharedService);

  // Cache para roles del usuario
  private _userRolesCache$ = new BehaviorSubject<RoleShared[] | null>(null);

  // ========================================
  // OBSERVABLES PÚBLICOS - REACTIVOS
  // ========================================
  public readonly isAuthenticated$ = this._authenticated.asObservable();
  public readonly isInitialized$ = this._isInitialized.asObservable();
  public readonly currentUser$ = this._currentUser.asObservable(); // ← MODIFICADO: Ahora reactivo

  // ========================================
  // GETTERS Y SETTERS DE TOKEN
  // ========================================
  set accessToken(token: string) {
    this.setTokenInStorage(token);
  }

  get accessToken(): string {
    return this.getTokenFromStorage();
  }

  get authenticated(): boolean {
    return this._authenticated.value;
  }

  // ========================================
  // MÉTODOS DE AUTENTICACIÓN - REACTIVOS
  // ========================================

  /**
   * Iniciar sesión con credenciales
   */
  signIn(credentials: SignInCredentials): Observable<AuthResponse> {
    if (this.authenticated) {
      return this.handleAlreadyLoggedIn();
    }

    return this.performSignIn(credentials);
  }

  /**
   * Iniciar sesión usando token almacenado
   */
  signInUsingToken(): Observable<boolean> {
    console.log('🔐 Attempting sign-in using stored token');

    return this.httpClient
      .post<AuthResponse>(`${environment.apiSecurity}/api/security/login_token`, {
        token: this.accessToken,
      })
      .pipe(
        switchMap(response => this.handleSuccessfulTokenLogin(response)),
        catchError(error => this.handleTokenLoginError(error))
      );
  }

  /**
   * Cerrar sesión - MEJORADO
   */
  signOut(): Observable<boolean> {
    console.log('👋 Signing out user');

    const currentUser = this._currentUser.value;
    if (currentUser) {
      console.log('👋 Signing out user:', currentUser.username);
    }

    this.clearAuthenticationState();
    console.log('✅ User signed out, state cleared');

    return of(true);
  }

  /**
   * Verificar estado de autenticación
   */
  check(): Observable<boolean> {
    if (this.authenticated) {
      console.log('✅ User already authenticated');
      this._isInitialized.next(true);
      return of(true);
    }

    if (!this.accessToken) {
      console.log('❌ No access token found');
      this.ensureCleanState();
      this._isInitialized.next(true);
      return of(false);
    }

    if (this.isTokenExpired()) {
      console.log('⏰ Token expired');
      this.ensureCleanState();
      this._isInitialized.next(true);
      return of(false);
    }

    return this.validateStoredToken();
  }

  // ========================================
  // MÉTODOS DE ROLES - Responsabilidad separada
  // ========================================

  /**
   * Obtener roles del usuario actual (con cache)
   */
  public getUserRoles(): Observable<RoleShared[]> {
    // Verificar que hay un usuario autenticado
    if (!this._authenticated.value || !this._currentUser.value) {
      console.log('❌ No authenticated user, returning empty roles');
      return of([]);
    }

    // Si ya tenemos roles en cache, usarlos
    if (this._userRolesCache$.value) {
      console.log('🎯 Using cached user roles');
      return of(this._userRolesCache$.value);
    }

    // Si no hay cache, obtener roles frescos
    return this.fetchUserRoles();
  }

  /**
   * Verificar si el usuario tiene alguno de los roles específicos
   */
  public hasRole(allowedRoles: Observable<RoleShared[]>): Observable<boolean> {
    return this.performRoleVerification(allowedRoles).pipe(
      map(result => result.hasRole),
      tap(hasRole => this.logRoleVerificationResult(hasRole))
    );
  }

  /**
   * Verificar roles de forma síncrona (si ya están cargados)
   */
  public hasSomeRole(allowedRoles: Observable<RoleShared[]>): Observable<boolean> {
    console.log('🔍 Checking roles synchronously');

    return combineLatest([
      this.getUserRoles(),
      allowedRoles
    ]).pipe(
      take(1),
      map(([userRoles, allowed]) => this.checkRoleMatch(userRoles, allowed)),
      tap(hasRole => console.log('🎭 Synchronous role check result:', hasRole)),
      catchError(error => this.handleRoleCheckError(error))
    );
  }

  /**
   * Obtener nombres de roles por IDs (reactivo)
   */
  public getRolesNames(roleIds: string[]): Observable<string[]> {
    if (!roleIds || roleIds.length === 0) {
      return of([]);
    }

    return this.rolesShared.getData().pipe(
      map(allRoles => this.extractRoleNames(allRoles, roleIds)),
      tap(roleNames => console.log('📋 Role names extracted:', roleNames))
    );
  }

  /**
   * Verificar si el usuario tiene un rol específico por nombre
   */
  public hasRoleByName(roleName: string): Observable<boolean> {
    return this.getUserRoles().pipe(
      map(userRoles => this.checkUserHasRoleName(userRoles, roleName)),
      tap(hasRole => console.log(`🎭 User has role "${roleName}":`, hasRole))
    );
  }

  /**
   * Verificar si el usuario tiene todos los roles especificados
   */
  public hasAllRoles(requiredRoles: Observable<RoleShared[]>): Observable<boolean> {
    return combineLatest([
      this.getUserRoles(),
      requiredRoles
    ]).pipe(
      take(1),
      map(([userRoles, required]) => this.checkUserHasAllRoles(userRoles, required)),
      tap(hasAllRoles => console.log('🎭 User has all required roles:', hasAllRoles))
    );
  }

  // ========================================
  // MÉTODOS PRIVADOS DE AUTENTICACIÓN - REACTIVOS
  // ========================================

  private performSignIn(credentials: SignInCredentials): Observable<AuthResponse> {
    console.log('🔑 Performing sign-in for user:', credentials.email);

    return this.httpClient
      .post<AuthResponse>(`${environment.apiSecurity}/api/login_check`, credentials)
      .pipe(
        switchMap(response => this.handleSuccessfulLogin(response)),
        catchError(error => this.handleLoginError(error))
      );
  }

  private handleSuccessfulLogin(response: AuthResponse): Observable<AuthResponse> {
    console.log('✅ Login successful for user:', response.user.username);

    this.setAuthenticationState(response);
    return of(response);
  }

  private handleSuccessfulTokenLogin(response: AuthResponse): Observable<boolean> {
    console.log('✅ Token login successful for user:', response.user.username);

    this.setAuthenticationState(response);
    this._isInitialized.next(true);
    return of(true);
  }

  private handleAlreadyLoggedIn(): Observable<AuthResponse> {
    const error = new Error('User is already logged in.');
    console.warn('⚠️', error.message);
    return throwError(() => error);
  }

  private handleLoginError(error: any): Observable<never> {
    console.error('❌ Login failed:', error);
    this.clearAuthenticationState();
    return throwError(() => error);
  }

  private handleTokenLoginError(error: any): Observable<boolean> {
    console.warn('⚠️ Token login failed:', error);
    this.clearAuthenticationState();
    this._isInitialized.next(true);
    return of(false);
  }

  private validateStoredToken(): Observable<boolean> {
    console.log('🔍 Validating stored token');
    return this.signInUsingToken();
  }

  // ========================================
  // GESTIÓN DE ESTADO - MEJORADA Y REACTIVA
  // ========================================

  /**
   * Establecer estado de autenticación - MEJORADO
   */
  private setAuthenticationState(response: AuthResponse): void {
    const previousUser = this._currentUser.value;
    const newUser = response.user;

    if (response.token) {
      this.accessToken = response.token;
    }

    // Verificar si el usuario ha cambiado
    const userChanged = !previousUser || previousUser.id !== newUser.id;

    if (userChanged) {
      console.log('🔄 User changed:', {
        from: previousUser?.username || 'none',
        to: newUser.username
      });

      // Limpiar cache al cambiar usuario
      this.clearUserRolesCache();
      this.clearSharedRolesCache();
    }

    // Actualizar estado reactivo
    this._authenticated.next(true);
    this._currentUser.next(newUser); // ← NUEVO: Emitir cambio de usuario
    this.userService.user = newUser;

    console.log('✅ Authentication state set for user:', newUser.username);
  }

  /**
   * Limpiar estado de autenticación - MEJORADO
   */
  private clearAuthenticationState(): void {
    const currentUser = this._currentUser.value;

    this.removeTokenFromStorage();
    this._authenticated.next(false);
    this._currentUser.next(null); // ← NUEVO: Emitir usuario null
    this.clearUserRolesCache();
    this.clearSharedRolesCache();

    console.log('🧹 Authentication state cleared for user:', currentUser?.username || 'unknown');
  }

  /**
   * Asegurar estado limpio - NUEVO
   */
  private ensureCleanState(): void {
    this._authenticated.next(false);
    this._currentUser.next(null);
    this.clearUserRolesCache();
    this.clearSharedRolesCache();
  }

  /**
   * Limpiar cache de roles del usuario - MEJORADO
   */
  private clearUserRolesCache(): void {
    console.log('🗑️ Clearing user roles cache');
    this._userRolesCache$.next(null);
  }

  /**
   * Limpiar cache de roles compartidos - NUEVO
   */
  private clearSharedRolesCache(): void {
    console.log('🗑️ Clearing shared roles cache');
    if (this.rolesShared.clearData) {
      this.rolesShared.clearData();
    }
  }

  // ========================================
  // MÉTODOS PRIVADOS DE ROLES
  // ========================================

  private fetchUserRoles(): Observable<RoleShared[]> {
    console.log('📡 Fetching user roles from server');

    return this.userService.getRoles().pipe(
      tap(roles => {
        console.log('👤 User roles loaded:', roles.length, 'roles for user:', this._currentUser.value?.username);
        this._userRolesCache$.next(roles); // Guardar en cache
      }),
      shareReplay(1), // Compartir resultado para múltiples suscriptores
      catchError(error => this.handleGetRolesError(error))
    );
  }

  private performRoleVerification(allowedRoles: Observable<RoleShared[]>): Observable<RoleVerificationResult> {
    return combineLatest([
      this.getUserRoles().pipe(take(1)),
      allowedRoles.pipe(take(1))
    ]).pipe(
      map(([userRoles, allowed]) => ({
        hasRole: this.checkRoleMatch(userRoles, allowed),
        userRoles,
        allowedRoles: allowed
      })),
      tap(result => this.logDetailedRoleVerification(result))
    );
  }

  private checkRoleMatch(userRoles: RoleShared[], allowedRoles: RoleShared[]): boolean {
    return userRoles.some(userRole =>
      allowedRoles.some(allowedRole => allowedRole.id === userRole.id)
    );
  }

  private checkUserHasRoleName(userRoles: RoleShared[], roleName: string): boolean {
    return userRoles.some(role => role.name === roleName);
  }

  private checkUserHasAllRoles(userRoles: RoleShared[], requiredRoles: RoleShared[]): boolean {
    return requiredRoles.every(requiredRole =>
      userRoles.some(userRole => userRole.id === requiredRole.id)
    );
  }

  private extractRoleNames(allRoles: RoleShared[], roleIds: string[]): string[] {
    const roleNames: string[] = [];

    for (const roleId of roleIds) {
      const foundRole = allRoles.find(role => role.id === roleId);
      if (foundRole) {
        roleNames.push(foundRole.name);
      }
    }

    return roleNames;
  }

  private handleGetRolesError(error: any): Observable<RoleShared[]> {
    console.error('❌ Error fetching user roles:', error);
    return of([]); // Fallback a array vacío
  }

  private handleRoleCheckError(error: any): Observable<boolean> {
    console.error('❌ Error checking roles:', error);
    return of(false); // Fallback a sin permisos
  }

  // ========================================
  // MÉTODOS PRIVADOS DE TOKEN
  // ========================================

  private setTokenInStorage(token: string): void {
    localStorage.setItem('accessToken', token);
  }

  private getTokenFromStorage(): string {
    return localStorage.getItem('accessToken') ?? '';
  }

  private removeTokenFromStorage(): void {
    localStorage.removeItem('accessToken');
  }

  private isTokenExpired(): boolean {
    return AuthUtils.isTokenExpired(this.accessToken);
  }

  // ========================================
  // MÉTODOS PRIVADOS DE LOGGING
  // ========================================

  private logRoleVerificationResult(hasRole: boolean): void {
    const currentUser = this._currentUser.value;
    const userInfo = currentUser ? `${currentUser.username }` : 'unknown';

    if (hasRole) {
      console.log(`✅ User ${userInfo} has one of the allowed roles`);
    } else {
      console.log(`❌ User ${userInfo} does not have any of the allowed roles`);
    }
  }

  private logDetailedRoleVerification(result: RoleVerificationResult): void {
    const currentUser = this._currentUser.value;
    const userInfo = currentUser ? `${currentUser.username}` : 'unknown';

    console.log(`🔍 Role verification details for ${userInfo}:`);
    console.log('  👤 User roles:', result.userRoles.map(r => r.name));
    console.log('  🎭 Allowed roles:', result.allowedRoles.map(r => r.name));
    console.log('  ✅ Has access:', result.hasRole);
  }

  // ========================================
  // MÉTODOS PÚBLICOS DE UTILIDAD - MEJORADOS
  // ========================================

  /**
   * Refrescar cache de roles del usuario
   */
  public refreshUserRoles(): Observable<RoleShared[]> {
    console.log('🔄 Refreshing user roles cache');
    this.clearUserRolesCache();
    return this.fetchUserRoles();
  }

  /**
   * Obtener estado actual de autenticación (para debugging) - MEJORADO
   */
  public getAuthStatus(): {
    authenticated: boolean;
    hasToken: boolean;
    tokenExpired: boolean;
    initialized: boolean;
    currentUser: string | undefined | null;
    rolesCount: number
  } {
    const currentUser = this._currentUser.value;
    const rolesCache = this._userRolesCache$.value;

    return {
      authenticated: this.authenticated,
      hasToken: !!this.accessToken,
      tokenExpired: this.isTokenExpired(),
      initialized: this._isInitialized.value,
      currentUser: currentUser ? (currentUser.username) : null,
      rolesCount: rolesCache?.length || 0
    };
  }

  /**
   * Debug del estado de autenticación - NUEVO
   */
  public debugAuthState(): void {
    const status = this.getAuthStatus();
    console.log('🐛 Auth State Debug:');
    console.log('  🔐 Authenticated:', status.authenticated);
    console.log('  👤 Current User:', status.currentUser || 'none');
    console.log('  🎭 Roles Count:', status.rolesCount);
    console.log('  🔑 Has Token:', status.hasToken);
    console.log('  ⏰ Token Expired:', status.tokenExpired);
    console.log('  ✅ Initialized:', status.initialized);
  }

  /**
   * Forzar actualización completa - NUEVO
   */
  public forceRefresh(): Observable<boolean> {
    console.log('💪 Forcing complete auth refresh');

    this.clearUserRolesCache();
    this.clearSharedRolesCache();

    if (this.authenticated && this.accessToken && !this.isTokenExpired()) {
      return this.signInUsingToken();
    } else {
      this.clearAuthenticationState();
      return of(false);
    }
  }
}
