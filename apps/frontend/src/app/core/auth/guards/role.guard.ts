import { inject, Injectable } from '@angular/core';
import {
  CanActivate,
  CanActivateChild,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError, tap, switchMap, take } from 'rxjs/operators';
import { AuthService } from '@core/auth/auth.service';
import { RoleSharedService } from '@modules/auth/role/repository/role-shared.service';

/**
 * Tipos de verificación de roles
 */
export enum RoleCheckType {
  ANY = 'any',    // Usuario debe tener al menos UNO de los roles
  ALL = 'all'     // Usuario debe tener TODOS los roles
}

/**
 * Configuración de roles para rutas
 */
export interface RoleConfig {
  roles: string[];                          // Roles requeridos
  checkType?: RoleCheckType;               // Tipo de verificación (ANY/ALL)
  redirectTo?: string;                     // Ruta de redirección personalizada
  errorMessage?: string;                   // Mensaje de error personalizado
  allowIfNoRoles?: boolean;               // Permitir acceso si no hay roles definidos
}

/**
 * Resultado de verificación de acceso
 */
interface AccessCheckResult {
  hasAccess: boolean;
  reason: string;
  redirectTo?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate, CanActivateChild {
  private roleService: RoleSharedService = inject(RoleSharedService);

  constructor(
    private _authService: AuthService,
    private _router: Router
  ) {}

  // ========================================
  // IMPLEMENTACIÓN DE GUARDS
  // ========================================

  /**
   * Guard principal para rutas
   */
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    return this.checkAccess(route, state);
  }

  /**
   * Guard para rutas hijas
   */
  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    return this.checkAccess(route, state);
  }

  // ========================================
  // LÓGICA PRINCIPAL DE VERIFICACIÓN
  // ========================================

  /**
   * Verificar acceso a la ruta basado en roles
   */
  private checkAccess(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {

    console.log(`🛡️ RoleGuard: Checking role access to route: ${state.url}`);

    // Parsear configuración de roles de la ruta
    const roleConfig = this.parseRoleConfig(route);

    // Log de configuración
    this.logRouteConfig(state.url, roleConfig);

    // Verificar roles directamente
    return this.checkRoles(roleConfig, state.url).pipe(
      catchError(error => this.handleError(error, state.url))
    );
  }

  // ========================================
  // PARSEO DE CONFIGURACIÓN
  // ========================================

  /**
   * Parsear configuración de roles desde los datos de la ruta
   */
  private parseRoleConfig(route: ActivatedRouteSnapshot): RoleConfig {
    const routeData = route.data;

    // Configuración completa
    if (routeData['roleConfig']) {
      const config = routeData['roleConfig'] as RoleConfig;
      return {
        checkType: RoleCheckType.ANY,
        allowIfNoRoles: false,
        ...config
      };
    }

    // Configuración simple (solo array de roles)
    if (routeData['roles']) {
      return {
        roles: routeData['roles'] as string[],
        checkType: RoleCheckType.ANY,
        allowIfNoRoles: false
      };
    }

    // Sin configuración de roles
    return {
      roles: [],
      checkType: RoleCheckType.ANY,
      allowIfNoRoles: true
    };
  }

  // ========================================
  // VERIFICACIONES DE ROLES
  // ========================================

  /**
   * Verificar roles del usuario
   */
  private checkRoles(roleConfig: RoleConfig, url: string): Observable<boolean | UrlTree> {
    // Si no hay roles requeridos
    if (!roleConfig.roles || roleConfig.roles.length === 0) {
      if (roleConfig.allowIfNoRoles) {
        console.log('✅ RoleGuard: No roles required, access granted');
        return of(true);
      } else {
        console.log('❌ RoleGuard: No roles specified but required');
        return this.redirectToUnauthorized(roleConfig.redirectTo);
      }
    }

    console.log(`🎭 RoleGuard: Checking roles [${roleConfig.roles.join(', ')}] with type: ${roleConfig.checkType}`);

    // Obtener roles requeridos
    const requiredRoles$ = this.roleService.getRolesByNames(roleConfig.roles);

    // Verificar según el tipo de check
    switch (roleConfig.checkType) {
      case RoleCheckType.ALL:
        return this.checkAllRoles(requiredRoles$, roleConfig, url);

      case RoleCheckType.ANY:
      default:
        return this.checkAnyRole(requiredRoles$, roleConfig, url);
    }
  }

  /**
   * Verificar que el usuario tenga AL MENOS UNO de los roles
   */
  private checkAnyRole(
    requiredRoles$: Observable<any[]>,
    roleConfig: RoleConfig,
    url: string
  ): Observable<boolean | UrlTree> {

    return this._authService.hasRole(requiredRoles$).pipe(
      take(1),
      switchMap(hasAnyRole => {
        const result: AccessCheckResult = {
          hasAccess: hasAnyRole,
          reason: hasAnyRole
            ? `User has at least one required role`
            : `User doesn't have any of the required roles: [${roleConfig.roles.join(', ')}]`,
          redirectTo: roleConfig.redirectTo
        };

        return this.processAccessResult(result, url);
      })
    );
  }

  /**
   * Verificar que el usuario tenga TODOS los roles
   */
  private checkAllRoles(
    requiredRoles$: Observable<any[]>,
    roleConfig: RoleConfig,
    url: string
  ): Observable<boolean | UrlTree> {

    return this._authService.hasAllRoles(requiredRoles$).pipe(
      take(1),
      switchMap(hasAllRoles => {
        const result: AccessCheckResult = {
          hasAccess: hasAllRoles,
          reason: hasAllRoles
            ? `User has all required roles`
            : `User doesn't have all required roles: [${roleConfig.roles.join(', ')}]`,
          redirectTo: roleConfig.redirectTo
        };

        return this.processAccessResult(result, url);
      })
    );
  }

  // ========================================
  // PROCESAMIENTO DE RESULTADOS
  // ========================================

  /**
   * Procesar resultado de verificación de acceso
   */
  private processAccessResult(result: AccessCheckResult, url: string): Observable<boolean | UrlTree> {
    if (result.hasAccess) {
      console.log(`✅ RoleGuard: Access granted to ${url} - ${result.reason}`);
      return of(true);
    } else {
      console.log(`❌ RoleGuard: Access denied to ${url} - ${result.reason}`);
      return this.redirectToUnauthorized(result.redirectTo);
    }
  }

  /**
   * Redirigir a página de no autorizado
   */
  private redirectToUnauthorized(customRedirect?: string): Observable<UrlTree> {
    const redirectPath = customRedirect || '/dashboard';
    console.log(`🚫 RoleGuard: Redirecting to ${redirectPath}`);

    const unauthorizedUrl = this._router.createUrlTree([redirectPath]);
    return of(unauthorizedUrl);
  }

  /**
   * Manejar errores en el guard
   */
  private handleError(error: any, url: string): Observable<UrlTree> {
    console.error(`❌ RoleGuard: Error checking role access to ${url}:`, error);

    // En caso de error, redirigir a página segura
    const errorUrl = this._router.createUrlTree(['/dashboard']);
    return of(errorUrl);
  }

  // ========================================
  // LOGGING Y DEBUGGING
  // ========================================

  /**
   * Log de configuración de la ruta
   */
  private logRouteConfig(url: string, config: RoleConfig): void {
    console.log(`🛡️ RoleGuard configuration for ${url}:`);
    console.log(`  📋 Required roles: [${config.roles.join(', ')}]`);
    console.log(`  🔍 Check type: ${config.checkType}`);
    console.log(`  ↩️ Redirect to: ${config.redirectTo || 'default'}`);
    console.log(`  ✅ Allow if no roles: ${config.allowIfNoRoles}`);
  }

  // ========================================
  // MÉTODOS PÚBLICOS DE UTILIDAD
  // ========================================

  /**
   * Verificar acceso a una ruta específica programáticamente
   */
  public checkRouteAccess(routePath: string, roleConfig: RoleConfig): Observable<boolean> {
    console.log(`🔍 Programmatic role check for route: ${routePath}`);

    return this.checkRoles(roleConfig, routePath).pipe(
      map(result => typeof result === 'boolean' ? result : false),
      catchError(() => of(false))
    );
  }

  /**
   * Obtener información de acceso sin redirigir
   */
  public getAccessInfo(roleConfig: RoleConfig): Observable<AccessCheckResult> {
    if (!roleConfig.roles || roleConfig.roles.length === 0) {
      return of({
        hasAccess: roleConfig.allowIfNoRoles || false,
        reason: 'No roles specified'
      });
    }

    const requiredRoles$ = this.roleService.getRolesByNames(roleConfig.roles);

    const checkMethod = roleConfig.checkType === RoleCheckType.ALL
      ? this._authService.hasAllRoles(requiredRoles$)
      : this._authService.hasRole(requiredRoles$);

    return checkMethod.pipe(
      take(1),
      map(hasAccess => ({
        hasAccess,
        reason: hasAccess
          ? 'User has required permissions'
          : `User lacks required roles: [${roleConfig.roles.join(', ')}]`
      })),
      catchError(error => of({
        hasAccess: false,
        reason: `Error checking permissions: ${error.message}`
      }))
    );
  }
}
