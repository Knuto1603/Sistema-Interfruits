import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { User } from './user.types';
import {catchError, map, Observable, of, ReplaySubject, switchMap, tap} from 'rxjs';
import {environment} from "@environments/environment";
import {RoleSharedService} from "@modules/auth/role/repository/role-shared.service";
import {RoleShared} from "@modules/auth/role/interface/role.interface";

@Injectable({ providedIn: 'root' })
export class UserService {
  private _httpClient = inject(HttpClient);
  private _user: ReplaySubject<User> = new ReplaySubject<User>(1);
  private rolesSharedService: RoleSharedService = inject(RoleSharedService);

  // -----------------------------------------------------------------------------------------------------
  // @ Accessors
  // -----------------------------------------------------------------------------------------------------

  /**
   * Setter & getter for user
   *
   * @param value
   */
  set user(value: User) {
    // Store the value
    this._user.next(value);
  }

  get user$(): Observable<User> {
    return this._user.asObservable();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Get the current signed-in user data
   */
  get(): Observable<User> {
    return this._httpClient.get<User>(`${environment.apiSecurity}/api/security/common/user`).pipe(
      tap((user) => {
        this._user.next(user);
      })
    );
  }

  /**
   * Update the user
   *
   * @param user
   */
  update(user: User): Observable<any> {
    return this._httpClient.patch<User>('api/common/user', { user }).pipe(
      map((response) => {
        this._user.next(response);
      })
    );
  }

  getRoles(): Observable<RoleShared[]> {
    return this.user$.pipe(
      switchMap(user =>
        this.rolesSharedService.getRolesByIds(user.roles)
      ),
      catchError(error => {
        console.error('Error fetching roles:', error);
        return of([]); // Devuelve un array vacío si ocurre un error
      })
    );
  }

}
