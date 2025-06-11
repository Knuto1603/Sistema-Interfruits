import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
	// eslint-disable-next-line @angular-eslint/component-selector
	selector: 'edit-button',
	imports: [MatIconModule, MatButtonModule],
	templateUrl: './edit-button.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditButtonComponent {
	@Input() type: 'button' | 'icon' = 'button';
}
