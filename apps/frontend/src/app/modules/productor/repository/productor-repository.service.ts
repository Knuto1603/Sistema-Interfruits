import {inject, Injectable, signal} from "@angular/core";
import {environment} from "@environments/environment";
import {HttpClient} from "@angular/common/http";
import {DownloadService} from "@shared/service/download.service";
import {Pagination} from "@shared/interface/pagination.interface";
import {LastProductorCode, Productor, ProductoresResponse} from "@modules/productor/interface/productor.interface";
import {PAGINATION} from "@shared/app.constants";
import {concatMap, map, Observable, of, tap} from "rxjs";
import {FilterData} from "@shared/interface/filter-data.interface";
import { ContextoService } from "@core/context/contexto.service";

@Injectable({
  providedIn: 'root',
})
export class ProductorRepositoryService {
  private urlApi: string = `${environment.apiCore}/api/productores`;

  private httpClient = inject(HttpClient);
  private downloadService = inject(DownloadService);
  private contextoService = inject(ContextoService);


  private _productores = signal<Productor[]>([]);
  private _pagination = signal<Pagination | null>(null);

  public productores = this._productores.asReadonly();
  public pagination = this._pagination.asReadonly();



  public getAll(
    page: number = PAGINATION.PAGE,
    itemsPerPage: number = PAGINATION.ITEMS_PER_PAGE,
    search: string = '',
    sort: string = '',
    direction: 'asc' | 'desc' | '' = 'asc'
  ): Observable<ProductoresResponse> {

    const contexto = this.contextoService.getContextoParaRequest();

    return this.httpClient
      .get<ProductoresResponse>(`${this.urlApi}/context`, {
        params: {
          page: page || PAGINATION.PAGE,
          itemsPerPage: itemsPerPage || PAGINATION.ITEMS_PER_PAGE,
          search: search || '',
          sort,
          direction,
          periodoId: contexto.periodoId ?? '',
          frutaId: contexto.frutaId ??  '',
        }
      })
      .pipe(
        tap((response) => {
          this._productores.set(response.items);
          this._pagination.set(response.pagination);
        })
      );
  }

  public get(id: string | null): Observable<Productor> {
    return this.httpClient.get<{ item: Productor }>(`${this.urlApi}/${id}`).pipe(map(({ item }) => item));
  }

  public create(productor: Productor): Observable<string> {
    return this.httpClient
      .post<{ status: boolean; message: string; item: Productor }>(`${this.urlApi}/`, productor)
      .pipe(
        concatMap(({ status, message, item }) => {
          if (status) {
            this._productores.update((items) => [item, ...items]);
          }

          return of(message);
        })
      );
  }

  public update(id: string, productor: Productor): Observable<string> {
    return this.httpClient
      .put<{ status: boolean; message: string; item: Productor }>(`${this.urlApi}/${id}`, productor)
      .pipe(
        concatMap(({ status, message, item }) => {
          if (status) {
            this._productores.update((items) => {
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

    return this.httpClient.patch<{ item: Productor; message: string }>(`${this.urlApi}/${id}/${type}`, {}).pipe(
      concatMap(({ item, message }) => {
        this._productores.update((items) => {
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
          this._productores.update((items) => items.filter((item) => item.id !== id));
        }

        return of(message);
      })
    );
  }

  public download(params: FilterData) {
    this.downloadService.down(`${this.urlApi}/download`, params);
  }

  public getLastCode(): Observable<string | null> {
    return this.httpClient.get<{ lastCode: string }>(`${this.urlApi}/last-code`).pipe(
      map(({ lastCode }) => {
        if (lastCode) {
          return lastCode;
        }
        return null;
      })
    );
  }

}
