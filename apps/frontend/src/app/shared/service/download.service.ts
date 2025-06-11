import { HttpClient } from '@angular/common/http';
import { DestroyRef, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { UtilsService } from './utils.service';

@Injectable({
	providedIn: 'root',
})
export class DownloadService {
	private httpClient: HttpClient = inject(HttpClient);
	private destroyRef: DestroyRef = inject(DestroyRef);

	down(path: string, params?: object) {
		this.httpClient
			.get(path, {
				observe: 'response',
				responseType: 'blob',
				params: params ? UtilsService.buildParams(params) : {},
			})
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe((response) => {
				if (!response.body) {
					return;
				}

				const type = response.headers.get('content-type') || undefined;
				const blob = new Blob([response.body], { type });
				const url = window.URL.createObjectURL(blob);

				try {
					const contentDisposition = response.headers.get('content-disposition');
					const fileName = contentDisposition?.split(';')[1]?.split('=')[1]?.replace(/"/g, '') || 'noname';
					const link = document.createElement('a');
					link.href = url;
					link.download = fileName || 'noname';
					link.click();
				} catch (error) {
					window.URL.revokeObjectURL(url);
					// console.error('error download', error);
				}
			});
	}
}
