import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

import { AlertService } from './alert.service';

export const alertInterceptor = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
	const alertService: AlertService = inject(AlertService);
	const newReq = req.clone();

	return next(newReq).pipe(
		catchError((error) => {
			console.error(error);
			alertService.hide();
			const message = error.error?.message || error?.message || 'Ha ocurrido un error';
			if (message !== undefined) {
				alertService.send(message, 'error');
			}

			return throwError(() => error.error || error);
		})
	);
};
