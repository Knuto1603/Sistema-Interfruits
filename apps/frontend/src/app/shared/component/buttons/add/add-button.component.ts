import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
	// eslint-disable-next-line @angular-eslint/component-selector
	selector: 'add-button',
	imports: [MatIconModule, MatButtonModule],
	templateUrl: './add-button.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddButtonComponent {}
