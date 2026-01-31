import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '@environments/environment';
import { PAGINATION } from '@shared/app.constants';
import { FilterData } from '@shared/interface/filter-data.interface';
import { Pagination } from '@shared/interface/pagination.interface';
import { DownloadService } from '@shared/service/download.service';
import { concatMap, map, Observable, of, tap } from 'rxjs';

import { Campanha, CampanhaShared, CampanhasResponse } from '../interface/campaña.interface';

@Injectable({
  providedIn: 'root',
})
export class CamphnaRepositoryService {
  private urlApi: string = `${environment.apiCore}/api/campahnas`;

  private httpClient = inject(HttpClient);
  private downloadService = inject(DownloadService);

  private _campahnas = signal<Campanha[]>([]);
  private _pagination = signal<Pagination | null>(null);

  public campahnas = this._campahnas.asReadonly();
  public pagination = this._pagination.asReadonly();

  public getAll(
    page: number = PAGINATION.PAGE,
    itemsPerPage: number = PAGINATION.ITEMS_PER_PAGE,
    search: string = '',
    sort: string = 'parent',
    direction: 'asc' | 'desc' | '' = 'asc'
  ): Observable<CampanhasResponse> {
    return this.httpClient
      .get<CampanhasResponse>(this.urlApi, {
        params: {
          page: page || PAGINATION.PAGE,
          itemsPerPage: itemsPerPage || PAGINATION.ITEMS_PER_PAGE,
          search: search || '',
          sort,
          direction,
        },
      })
      .pipe(
        tap((response) => {
          this._campahnas.set(response.items);
          this._pagination.set(response.pagination);
        })
      );
  }
  public get(id: string | null): Observable<Campanha> {
    return this.httpClient.get<{ item: Campanha }>(`${this.urlApi}/${id}`).pipe(map(({ item }) => item));
  }

  public create(campanha: Campanha): Observable<string> {
    return this.httpClient
      .post<{ status: boolean; message: string; item: Campanha }>(`${this.urlApi}/`, campanha)
      .pipe(
        concatMap(({ status, message, item }) => {
          if (status) {
            this._campahnas.update((items) => [item, ...items]);
          }

          return of(message);
        })
      );
  }

  public update(id: string, camphna: Campanha): Observable<string> {
    return this.httpClient
      .put<{ status: boolean; message: string; item: Campanha }>(`${this.urlApi}/${id}`, camphna)
      .pipe(
        concatMap(({ status, message, item }) => {
          if (status) {
            this._campahnas.update((items) => {
              const index = items.findIndex((i) => i.id === id);
              if (index >= 0) {
                const updated = [...items];
                updated[index] = item;

                return updated;
              }

              return items;
            });
          }

          return of(message);
        })
      );
  }

  public changeActive(id: string, active: boolean): Observable<string> {
    const type: 'disable' | 'enable' = active ? 'disable' : 'enable';

    return this.httpClient.patch<{ item: Campanha; message: string }>(`${this.urlApi}/${id}/${type}`, {}).pipe(
      concatMap(({ item, message }) => {
        this._campahnas.update((items) => {
          const index = items.findIndex((i) => i.id === id);
          if (index >= 0) {
            const updated = [...items];
            updated[index] = item;

            return updated;
          }

          return items;
        });

        return of(message);
      })
    );
  }

  public delete(id: string): Observable<string> {
    return this.httpClient.delete<{ status: boolean; message: string }>(`${this.urlApi}/${id}`).pipe(
      concatMap(({ status, message }) => {
        if (status) {
          this._campahnas.update((items) => items.filter((item) => item.id !== id));
        }

        return of(message);
      })
    );
  }

  public download(params: FilterData) {
    this.downloadService.down(`${this.urlApi}/download`, params);
  }
}
