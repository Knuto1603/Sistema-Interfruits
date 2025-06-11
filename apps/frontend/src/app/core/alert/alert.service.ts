import { Injectable } from '@angular/core';
import { FuseAlertType } from '@coreui2/components/alert';
import { BehaviorSubject, Observable } from 'rxjs';

import { Alert } from './alert.types';

@Injectable({
	providedIn: 'root',
})
export class AlertService {
	private show: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	// @ts-ignore
  private alert: BehaviorSubject<Alert> = new BehaviorSubject<Alert>(null);

	public show$: Observable<boolean> = this.show.asObservable();
	public alert$: Observable<Alert> = this.alert.asObservable();

	private closedAuto: any;

	public send(message: string, type: FuseAlertType = 'info'): void {
		// this.hide();
		this.show.next(true);
		this.alert.next({ type, message });
		this.closeAlert(type);
	}

	public hide(): void {
		if (this.show.value) {
			this.show.next(false);
			clearTimeout(this.closedAuto);
		}
	}

	private closeAlert(type: FuseAlertType): void {
		if (type === 'error') {
			return;
		}

		this.closedAuto = setTimeout((): void => {
			this.show.next(false);
		}, 5000);
	}
}
