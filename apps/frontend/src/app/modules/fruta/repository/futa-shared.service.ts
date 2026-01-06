import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '@environments/environment';
import { StorageService } from '@shared/service/storage.service';
import { map, Observable, of, share, tap } from 'rxjs';
import {FrutaShared} from "@modules/fruta/interface/fruta.interface";

@Injectable({
  providedIn: 'root',
})
export class FrutasSharedService {
  private urlApi: string = `${environment.apiCore}/api/frutas`;

  private httpClient: HttpClient = inject(HttpClient);
  private storage: StorageService = inject(StorageService);

  private readonly localStorageKeyShared = 'frutas-shared';
  private _frutas = signal<FrutaShared[]>([]);
  public frutas = this._frutas.asReadonly();

  getDataLocal(): Observable<FrutaShared[]> {
    const localData = this.storage.get(this.localStorageKeyShared);
    const items = localData ? JSON.parse(localData) : [];
    this._frutas.set(items);

    if (!localData) {
      this.getDataApi().subscribe();
    }

    return of(items);
  }

  getDataApi(): Observable<FrutaShared[]> {
    const url = `${this.urlApi}/shared`;

    return this.httpClient.get<{ items: FrutaShared[] }>(url).pipe(
      map(({ items }) => items),
      tap((items) => {
        this._frutas.set(items);
        this.storage.set(this.localStorageKeyShared, JSON.stringify(items));
      }),
      share()
    );
  }

  clearData(): void {
    this._frutas.set([]);
    this.storage.remove(this.localStorageKeyShared);
  }
}
