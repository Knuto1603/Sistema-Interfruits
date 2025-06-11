import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '@environments/environment';
import { PAGINATION } from '@shared/app.constants';
import { FilterData } from '@shared/interface/filter-data.interface';
import { Pagination } from '@shared/interface/pagination.interface';
import { DownloadService } from '@shared/service/download.service';
import { concatMap, map, Observable, of, tap } from 'rxjs';

import { Parametro, ParametroParentResponse, ParametrosResponse } from '../interface/parametro.interface';

@Injectable({
	providedIn: 'root',
})
export class ParametroRepositoryService {
	private urlApi: string = `${environment.apiCore}/api/parametros`;

	private httpClient = inject(HttpClient);
	private downloadService = inject(DownloadService);

	private _parametros = signal<Parametro[]>([]);
	private _pagination = signal<Pagination | null>(null);

	public parametros = this._parametros.asReadonly();
	public pagination = this._pagination.asReadonly();

	public getAll(
		page: number = PAGINATION.PAGE,
		itemsPerPage: number = PAGINATION.ITEMS_PER_PAGE,
		search: string = '',
		sort: string = 'parent',
		direction: 'asc' | 'desc' | '' = 'asc'
	): Observable<ParametrosResponse> {
		return this.httpClient
			.get<ParametrosResponse>(this.urlApi, {
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
					this._parametros.set(response.items);
					this._pagination.set(response.pagination);
				})
			);
	}

	getParents(): Observable<ParametroParentResponse[]> {
		return this.httpClient
			.get<{ items: ParametroParentResponse[] }>(`${this.urlApi}/parents`)
			.pipe(map(({ items }) => items));
	}

	public get(id: string | null): Observable<Parametro> {
		return this.httpClient.get<{ item: Parametro }>(`${this.urlApi}/${id}`).pipe(map(({ item }) => item));
	}

	public create(parametro: Parametro): Observable<string> {
		return this.httpClient
			.post<{ status: boolean; message: string; item: Parametro }>(`${this.urlApi}/`, parametro)
			.pipe(
				concatMap(({ status, message, item }) => {
					if (status) {
						this._parametros.update((items) => [item, ...items]);
					}

					return of(message);
				})
			);
	}

	public update(id: string, parametro: Parametro): Observable<string> {
		return this.httpClient
			.put<{ status: boolean; message: string; item: Parametro }>(`${this.urlApi}/${id}`, parametro)
			.pipe(
				concatMap(({ status, message, item }) => {
					if (status) {
						this._parametros.update((items) => {
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

		return this.httpClient.patch<{ item: Parametro; message: string }>(`${this.urlApi}/${id}/${type}`, {}).pipe(
			concatMap(({ item, message }) => {
				this._parametros.update((items) => {
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
					this._parametros.update((items) => items.filter((item) => item.id !== id));
				}

				return of(message);
			})
		);
	}

	public download(params: FilterData) {
		this.downloadService.down(`${this.urlApi}/download`, params);
	}
}
