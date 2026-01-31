import {inject, Injectable, signal} from "@angular/core";
import {environment} from "@environments/environment";
import {HttpClient} from "@angular/common/http";
import {DownloadService} from "@shared/service/download.service";
import {Pagination} from "@shared/interface/pagination.interface";
import {PAGINATION} from "@shared/app.constants";
import {concatMap, map, Observable, of, tap} from "rxjs";
import {FilterData} from "@shared/interface/filter-data.interface";
import {Fruta, FrutaShared, FrutasResponse} from "../interface/fruta.interface";

@Injectable({
  providedIn: 'root',
})
export class FrutaRepositoryService {
  private urlApi: string = `${environment.apiCore}/api/frutas`;

  private httpClient = inject(HttpClient);
  private downloadService = inject(DownloadService);

  private _frutas = signal<Fruta[]>([]);
  private _pagination = signal<Pagination | null>(null);

  public frutas = this._frutas.asReadonly();
  public pagination = this._pagination.asReadonly();

  public getAll(
    page: number = PAGINATION.PAGE,
    itemsPerPage: number = PAGINATION.ITEMS_PER_PAGE,
    search: string = '',
    sort: string = '',
    direction: 'asc' | 'desc' | '' = 'asc'
  ): Observable<FrutasResponse> {
    return this.httpClient
      .get<FrutasResponse>(this.urlApi, {
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
          this._frutas.set(response.items);
          this._pagination.set(response.pagination);
        })
      );
  }

  public get(id: string | null): Observable<Fruta> {
    return this.httpClient.get<{ item: Fruta }>(`${this.urlApi}/${id}`)
      .pipe(
        map(({ item }) => item)
      );
  }

  public getShared(): Observable<FrutaShared[]> {
    return this.httpClient
      .get<{items: FrutaShared[]}>(`${this.urlApi}/shared`)
      .pipe(
        map(({ items }) => items)
      );
  }

  public create(fruta: Fruta): Observable<string> {
    return this.httpClient
      .post<{ status: boolean; message: string; item: Fruta }>(`${this.urlApi}/`, fruta)
      .pipe(
        concatMap(({ status, message, item }) => {
          if (status) {
            this._frutas.update((items) => [item, ...items]);
          }

          return of(message);
        })
      );
  }

  public update(id: string, fruta: Fruta): Observable<string> {
    return this.httpClient
      .put<{ status: boolean; message: string; item: Fruta }>(`${this.urlApi}/${id}`, fruta)
      .pipe(
        concatMap(({ status, message, item }) => {
          if (status) {
            this._frutas.update((items) => {
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

    return this.httpClient.patch<{ item: Fruta; message: string }>(`${this.urlApi}/${id}/${type}`, {}).pipe(
      concatMap(({ item, message }) => {
        this._frutas.update((items) => {
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
          this._frutas.update((items) => items.filter((item) => item.id !== id));
        }

        return of(message);
      })
    );
  }

  public download(params: FilterData) {
    this.downloadService.down(`${this.urlApi}/download`, params);
  }


}
