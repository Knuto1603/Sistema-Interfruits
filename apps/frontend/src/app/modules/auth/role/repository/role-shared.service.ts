import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '@environments/environment';
import { StorageService } from '@shared/service/storage.service';
import { map, Observable, of, share, tap } from 'rxjs';

import { RoleShared } from '../interface/role.interface';

@Injectable({
  providedIn: 'root',
})
export class RoleSharedService {
  private urlApi: string = `${environment.apiSecurity}/api/user_roles`;

  private httpClient: HttpClient = inject(HttpClient);
  private storage: StorageService = inject(StorageService);

  private readonly localStorageKeyShared = 'roles-shared';
  private _roles = signal<RoleShared[]>([]);
  public roles = this._roles.asReadonly();

  getDataLocal(): Observable<RoleShared[]> {
    const localData = this.storage.get(this.localStorageKeyShared);
    const items = localData ? JSON.parse(localData) : [];
    this._roles.set(items);

    if (!localData) {
      this.getDataApi().subscribe();
    }

    return of(items);
  }

  getDataApi(): Observable<RoleShared[]> {
    const url = `${this.urlApi}/shared`;

    return this.httpClient.get<{ items: RoleShared[] }>(url).pipe(
      map(({ items }) => items),
      tap((items) => {
        this._roles.set(items);
        this.storage.set(this.localStorageKeyShared, JSON.stringify(items), 600);
      }),
      share()
    );
  }

  clearData(): void {
    this._roles.set([]);
    this.storage.remove(this.localStorageKeyShared);
  }
}
