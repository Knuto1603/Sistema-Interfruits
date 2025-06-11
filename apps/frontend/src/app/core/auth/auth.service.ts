import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthUtils } from './auth.utils';
import { UserService } from '../user/user.service';
import { catchError, Observable, of, switchMap, throwError } from 'rxjs';
import { User } from '../user/user.types';
import {environment} from "@environments/environment";

@Injectable({ providedIn: 'root' })
export class AuthService {
  private authenticated: boolean = false;
  private httpClient: HttpClient = inject(HttpClient);
  private userService: UserService = inject(UserService);

  set accessToken(token: string) {
    localStorage.setItem('accessToken', token);
  }

  get accessToken(): string {
    return localStorage.getItem('accessToken') ?? '';
  }

  signIn(credentials: { email: string; password: string }): Observable<{ token: string; user: User }> {
    if (this.authenticated) {
      return throwError(() => 'User is already logged in.');
    }

    return this.httpClient
      .post<{ token: string; user: User }>(`${environment.apiSecurity}/api/login_check`, credentials)
      .pipe(
        switchMap((response) => {
          this.accessToken = response.token;
          this.authenticated = true;
          this.userService.user = response.user;

          return of(response);
        })
      );
  }

  signInUsingToken(): Observable<boolean> {
    return this.httpClient
      .post<{ token: string; user: User }>(`${environment.apiSecurity}/api/security/login_token`, {
        token: this.accessToken,
      })
      .pipe(
        switchMap((response) => {
          if (response.token) {
            this.accessToken = response.token;
          }
          this.authenticated = true;
          this.userService.user = response.user;

          return of(true);
        }),
        catchError(() => of(false))
      );
  }

  signOut(): Observable<boolean> {
    localStorage.removeItem('accessToken');
    this.authenticated = false;

    return of(true);
  }

  check(): Observable<boolean> {
    if (this.authenticated) {
      return of(true);
    }

    if (!this.accessToken) {
      return of(false);
    }

    if (AuthUtils.isTokenExpired(this.accessToken)) {
      return of(false);
    }

    return this.signInUsingToken();
  }
}
