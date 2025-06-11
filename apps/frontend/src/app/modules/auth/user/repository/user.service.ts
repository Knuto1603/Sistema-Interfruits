import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '@environments/environment';
import { PAGINATION } from '@shared/app.constants';
import { FilterData } from '@shared/interface/filter-data.interface';
import { Pagination } from '@shared/interface/pagination.interface';
import { DownloadService } from '@shared/service/download.service';
import { concatMap, map, Observable, of, tap } from 'rxjs';

import { User, UsersResponse } from '../interface/user.interface';

@Injectable({
	providedIn: 'root',
})
export class UserService {
	private urlApi: string = `${environment.apiSecurity}/api/users`;

	private httpClient: HttpClient = inject(HttpClient);
	private downloadService: DownloadService = inject(DownloadService);

	private _users = signal<User[]>([]);
	private _pagination = signal<Pagination | null>(null);

	public users = this._users.asReadonly();
	public pagination = this._pagination.asReadonly();

	public getAll(
		page: number = PAGINATION.PAGE,
		itemsPerPage: number = PAGINATION.ITEMS_PER_PAGE,
		search: string = '',
		sort: string = 'fullname',
		direction: 'asc' | 'desc' | '' = 'asc'
	): Observable<UsersResponse> {
		return this.httpClient
			.get<UsersResponse>(`${this.urlApi}/`, {
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
					this._users.set(response.items);
					this._pagination.set(response.pagination);
				})
			);
	}

	public get(id: string): Observable<User> {
		return this.httpClient.get<{ item: User }>(`${this.urlApi}/${id}`).pipe(map(({ item }) => item));
	}

	public create(user: User): Observable<string> {
		return this.httpClient.post<{ status: boolean; message: string; item: User }>(`${this.urlApi}/`, user).pipe(
			concatMap(({ status, message, item }) => {
				if (status) {
					this._users.update((items) => [item, ...items]);
					this.updateCountPagination(1);
				}

				return of(message);
			})
		);
	}

	public update(id: string, user: User): Observable<string> {
		return this.httpClient.put<{ status: boolean; message: string; item: User }>(`${this.urlApi}/${id}`, user).pipe(
			concatMap(({ status, message, item }) => {
				if (status) {
					this._users.update((items) => {
						const index = items.findIndex((item) => item.id === id);
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

		return this.httpClient.patch<{ status: boolean; message: string }>(`${this.urlApi}/${id}/${type}`, {}).pipe(
			concatMap(({ status, message }) => {
				if (status) {
					this._users.update((items) => {
						const index = items.findIndex((item) => item.id === id);
						if (index >= 0) {
							const updated = [...items];
							updated[index].isActive = !active;

							return updated;
						}

						return items;
					});
				}

				return of(message);
			})
		);
	}

	public delete(id: string): Observable<string> {
		return this.httpClient.delete<{ status: boolean; message: string }>(`${this.urlApi}/${id}`).pipe(
			concatMap(({ status, message }) => {
				if (status) {
					this._users.update((items) => items.filter((item) => item.id !== id));
					this.updateCountPagination(-1);
				}

				return of(message);
			})
		);
	}

	public download(params: FilterData) {
		this.downloadService.down(`${this.urlApi}/download`, params);
	}

	private updateCountPagination(value: number) {
		this._pagination.update((pagination) => {
			if (pagination) {
				return { ...pagination, count: pagination.count + value, totalItems: pagination.totalItems + value };
			}

			return pagination;
		});
	}
}
