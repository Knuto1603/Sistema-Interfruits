import { Directive, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { debounceTime, Subject, Subscription } from 'rxjs';

@Directive({
	selector: '[appDebounceClick]',
	standalone: true,
})
export class DebounceClickDirective implements OnInit, OnDestroy {
	@Input()
	debounceTime: number = 200;

	@Output()
	debounceClick = new EventEmitter();

	private clicks = new Subject();
	private subscription: Subscription;

	ngOnInit(): void {
		this.subscription = this.clicks
			.pipe(debounceTime(this.debounceTime))
			.subscribe((e) => this.debounceClick.emit(e));
	}

	ngOnDestroy(): void {
		this.subscription.unsubscribe();
	}

	@HostListener('click', ['$event'])
	clickEvent(event: MouseEvent): void {
		event.preventDefault();
		event.stopPropagation();
		this.clicks.next(event);
	}
}
