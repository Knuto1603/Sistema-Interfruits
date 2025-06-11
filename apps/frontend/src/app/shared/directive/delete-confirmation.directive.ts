import { DestroyRef, Directive, EventEmitter, HostListener, inject, OnInit, Output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';

import { ConfirmationService } from '../service/confirmation.service';

@Directive({
	selector: '[appDeleteConfirmation]',
	standalone: true,
})
export class DeleteConfirmationDirective implements OnInit {
	private destroyRef: DestroyRef = inject(DestroyRef);
	private confirmationService: ConfirmationService = inject(ConfirmationService);

	@Output()
	confirmationClick = new EventEmitter();

	private clicks = new Subject();

	ngOnInit(): void {
		this.clicks.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => this.confirmationClick.emit(event));
	}

	@HostListener('click', ['$event'])
	clickEvent(event: MouseEvent): void {
		event.preventDefault();
		event.stopPropagation();
		this.confirmationService
			.delete()
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe((result) => {
				if (result === 'confirmed') {
					this.clicks.next(event);
				}
			});
	}
}
