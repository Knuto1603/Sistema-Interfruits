import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
	// eslint-disable-next-line @angular-eslint/component-selector
	selector: 'view-button',
	imports: [MatButtonModule, MatIconModule],
	templateUrl: './view-button.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewButtonComponent {
	@Input() type: 'button' | 'icon' = 'button';
}
