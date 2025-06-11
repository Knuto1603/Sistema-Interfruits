import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { PAGINATION } from '@shared/app.constants';
import { FilterData } from '@shared/interface/filter-data.interface';
import { Pagination } from '@shared/interface/pagination.interface';
import { DownloadService } from '@shared/service/download.service';
import { BehaviorSubject, concatMap, map, Observable, of, switchMap, take, tap } from 'rxjs';

import { Role, RolesResponse } from '../interface/role.interface';

@Injectable({
	providedIn: 'root',
})
export class RoleService {
	private urlApi: string = `${environment.apiSecurity}/api/user_roles`;

	private httpClient: HttpClient = inject(HttpClient);
	private downloadService: DownloadService = inject(DownloadService);

	private roles: BehaviorSubject<Role[]> = new BehaviorSubject<Role[]>([]);
	private pagination: BehaviorSubject<Pagination> = new BehaviorSubject<Pagination>(null!);
	private rolesShared: BehaviorSubject<Role[]> = new BehaviorSubject<Role[]>([]);

	public roles$: Observable<Role[]> = this.roles.asObservable();
	public pagination$: Observable<Pagination> = this.pagination.asObservable();
	public rolesShared$: Observable<Role[]> = this.rolesShared.asObservable();

	public getAll(
		page: number = PAGINATION.PAGE,
		limit: number = PAGINATION.ITEMS_PER_PAGE,
		search: string = '',
		sort: string = 'nombre',
		order: 'asc' | 'desc' | '' = 'asc'
	): Observable<RolesResponse> {
		return this.httpClient
			.get<RolesResponse>(`${this.urlApi}/`, {
				params: {
					page: page || PAGINATION.PAGE,
					limit: limit || PAGINATION.ITEMS_PER_PAGE,
					search: search || '',
					sort,
					order,
				},
			})
			.pipe(
				tap((response) => {
					this.roles.next(response.items);
					this.pagination.next(response.pagination);
				})
			);
	}

  public getAllShared(): Observable<Role[]> {
    return this.httpClient.get<{ items: Role[] }>(`${this.urlApi}/shared`).pipe(
      map(({ items }) => {
        this.rolesShared.next(items);

        return items;
      })
    );
  }


  public get(id: string): Observable<Role> {
		return this.httpClient.get<{ item: Role }>(`${this.urlApi}/${id}`).pipe(map(({ item }) => item));
	}

	public create(role: Role): Observable<string> {
		return this.roles$.pipe(
			take(1),
			switchMap((roles) =>
				this.httpClient.post<{ item: Role; message: string }>(`${this.urlApi}/`, role).pipe(
					map(({ item, message }) => {
						this.roles.next([item, ...roles]);
						this.changePagination(1);

						return message;
					})
				)
			)
		);
	}

	public update(id: number, role: Role): Observable<string> {
		return this.roles$.pipe(
			take(1),
			switchMap((roles) =>
				this.httpClient.put<{ item: Role; message: string }>(`${this.urlApi}/${id}`, role).pipe(
					map(({ item, message }) => {
						const index: number = roles.findIndex((role) => role.id === item.id);
						roles[index] = item;
						this.roles.next(roles);

						return message;
					})
				)
			)
		);
	}

	public disable(id: number): Observable<string> {
		return this.httpClient.patch<{ item: Role; message: string }>(`${this.urlApi}/disable/${id}`, {}).pipe(
			concatMap(({ message }) => {
				const updatedRoles: Role[] = [...this.roles.value];
				const index: number = updatedRoles.findIndex((role) => role.id === id);
				updatedRoles[index].isActive = false;
				this.roles.next(updatedRoles);

				return of(message);
			})
		);
	}

	public enable(id: number): Observable<string> {
		return this.httpClient.patch<{ item: Role; message: string }>(`${this.urlApi}/enable/${id}`, {}).pipe(
			concatMap(({ message }) => {
				const updatedRoles: Role[] = [...this.roles.value];
				const index: number = updatedRoles.findIndex((role) => role.id === id);
				updatedRoles[index].isActive = true;
				this.roles.next(updatedRoles);

				return of(message);
			})
		);
	}

	public delete(id: number): Observable<string> {
		return this.roles$.pipe(
			take(1),
			switchMap((roles) =>
				this.httpClient.delete<{ message: string }>(`${this.urlApi}/delete/${id}`).pipe(
					map(({ message }) => {
						const index: number = roles.findIndex((role) => role.id === id);
						roles.splice(index, 1);
						this.roles.next(roles);
						this.changePagination(-1);

						return message;
					})
				)
			)
		);
	}

	public download(params: FilterData) {
		this.downloadService.down(`${this.urlApi}/download`, params);
	}

	private changePagination(value: number) {
		this.pagination.value.totalItems += value;
	}
}
