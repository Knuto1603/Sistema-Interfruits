import { ChangeDetectionStrategy, Component, Input, Output } from '@angular/core';
import { ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { debounceTime, distinctUntilChanged, Observable } from 'rxjs';

import { Pagination } from '../../interface/pagination.interface';

@Component({
	// eslint-disable-next-line @angular-eslint/component-selector
	selector: 'search-input',
	imports: [ReactiveFormsModule, MatFormFieldModule, MatIconModule, MatInputModule],
	templateUrl: './search-input.component.html',
	styles: [],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchInputComponent {
	@Input({ required: true }) pagination: Pagination | null = null;
	searchInputControl = new UntypedFormControl();
	@Output() valueChanged: Observable<string> = this.searchInputControl.valueChanges.pipe(
		debounceTime(400),
		distinctUntilChanged()
	);
}
