import { Injectable } from '@angular/core';
import { FuseConfirmationService } from '../../../@coreui/services/confirmation/confirmation.service';
import { Observable } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class ConfirmationService {
	constructor(private _confirmationService: FuseConfirmationService) {}

	delete(): Observable<'confirmed' | 'cancelled' | undefined> {
		const confirmation = this._confirmationService.open({
			title: 'Eliminar',
			message: '¿Está seguro de que desea eliminar este registro? ¡Esta acción no se puede deshacer!',
			actions: {
				confirm: {
					label: 'Eliminar',
				},
				cancel: {
					label: 'Cancelar',
				},
			},
		});

		return confirmation.afterClosed();
	}
}
