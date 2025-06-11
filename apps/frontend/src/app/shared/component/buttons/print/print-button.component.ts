import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
	// eslint-disable-next-line @angular-eslint/component-selector
	selector: 'print-button',
	imports: [MatButtonModule, MatIconModule],
	templateUrl: './print-button.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrintButtonComponent {
	@Input() type: 'button' | 'icon' = 'button';
}
