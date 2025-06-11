import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '@environments/environment';
import { StorageService } from '@shared/service/storage.service';
import { map, Observable, of, share, tap } from 'rxjs';

import { ParametroShared } from '../interface/parametro.interface';

@Injectable({
	providedIn: 'root',
})
export class ParametroSharedService {
	private urlApi: string = `${environment.apiCore}/api/parametros`;

	private httpClient: HttpClient = inject(HttpClient);
	private storage: StorageService = inject(StorageService);

	private readonly localStorageKeyShared = 'parametros-shared';
	private _parametros = signal<ParametroShared[]>([]);
	public parametros = this._parametros.asReadonly();

	getDataLocal(): Observable<ParametroShared[]> {
		const localData = this.storage.get(this.localStorageKeyShared);
		const items = localData ? JSON.parse(localData) : [];
		this._parametros.set(items);

		if (!localData) {
			this.getDataApi().subscribe();
		}

		return of(items);
	}

	getDataApi(): Observable<ParametroShared[]> {
		const url = `${this.urlApi}/shared`;

		return this.httpClient.get<{ items: ParametroShared[] }>(url).pipe(
			map(({ items }) => items),
			tap((items) => {
				this._parametros.set(items);
				this.storage.set(this.localStorageKeyShared, JSON.stringify(items), 600);
			}),
			share()
		);
	}

	clearData(): void {
		this._parametros.set([]);
		this.storage.remove(this.localStorageKeyShared);
	}
}
