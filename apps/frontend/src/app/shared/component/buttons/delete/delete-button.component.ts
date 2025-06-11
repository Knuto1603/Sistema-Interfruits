import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
	// eslint-disable-next-line @angular-eslint/component-selector
	selector: 'delete-button',
	imports: [MatIconModule, MatButtonModule],
	templateUrl: './delete-button.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteButtonComponent {
	@Input() type: 'button' | 'icon' = 'button';
}
