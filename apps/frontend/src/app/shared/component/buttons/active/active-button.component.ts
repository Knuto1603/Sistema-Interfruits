import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
	// eslint-disable-next-line @angular-eslint/component-selector
	selector: 'active-button',
	imports: [MatButtonModule, MatIconModule],
	templateUrl: './active-button.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActiveButtonComponent {
	@Input({ required: true }) active: boolean;
}
