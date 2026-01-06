import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '@environments/environment';
import { StorageService } from '@shared/service/storage.service';
import { map, Observable, of, share, tap } from 'rxjs';
import {PeriodoShared} from "@modules/periodo/interface/periodo.interface";

@Injectable({
  providedIn: 'root',
})
export class PeriodosSharedService {
  private urlApi: string = `${environment.apiCore}/api/periodos`;

  private httpClient: HttpClient = inject(HttpClient);
  private storage: StorageService = inject(StorageService);

  private readonly localStorageKeyShared = 'periodo-shared';
  private _periodos = signal<PeriodoShared[]>([]);
  public periodos = this._periodos.asReadonly();

  getDataLocal(): Observable<PeriodoShared[]> {
    const localData = this.storage.get(this.localStorageKeyShared);
    const items = localData ? JSON.parse(localData) : [];
    this._periodos.set(items);

    if (!localData) {
      this.getDataApi().subscribe();
    }

    return of(items);
  }

  getDataApi(): Observable<PeriodoShared[]> {
    const url = `${this.urlApi}/shared`;

    return this.httpClient.get<{ items: PeriodoShared[] }>(url).pipe(
      map(({ items }) => items),
      tap((items) => {
        this._periodos.set(items);
        this.storage.set(this.localStorageKeyShared, JSON.stringify(items));
      }),
      share()
    );
  }

  clearData(): void {
    this._periodos.set([]);
    this.storage.remove(this.localStorageKeyShared);
  }
}
