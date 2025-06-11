import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
	// eslint-disable-next-line @angular-eslint/component-selector
	selector: 'list-button',
	standalone: true,
	imports: [MatButtonModule, MatIconModule],
	templateUrl: './list-button.component.html',
	styles: [],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListButtonComponent {
	@Input() type: 'button' | 'icon' = 'button';
}
