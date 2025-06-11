import { NgIf } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { fuseAnimations } from '@coreui2/animations';
import { FuseAlertComponent } from '@coreui2/components/alert';

import { AlertService } from './alert.service';
import { Alert } from './alert.types';

@Component({
	selector: 'app-alert',
	standalone: true,
	imports: [MatProgressBarModule, NgIf, FuseAlertComponent],
	templateUrl: './alert.component.html',
	styleUrls: ['./alert.component.scss'],
	animations: fuseAnimations,
})
export class AlertComponent implements OnInit {
	private alertService: AlertService = inject(AlertService);
	private destroyRef: DestroyRef = inject(DestroyRef);

	show: boolean = false;
	message: string = '';
	alert: Alert;

	ngOnInit(): void {
		this.alertService.show$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
			this.show = value;
		});

		this.alertService.alert$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value: Alert): void => {
			this.alert = value;
		});
	}

	public closed(event: boolean): void {
		if (event) {
			this.alertService.hide();
		}
	}
}
