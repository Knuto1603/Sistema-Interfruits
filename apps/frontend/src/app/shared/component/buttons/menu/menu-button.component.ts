import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
	// eslint-disable-next-line @angular-eslint/component-selector
	selector: 'menu-button',
	imports: [MatButtonModule, MatIconModule],
	templateUrl: './menu-button.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuButtonComponent {}
