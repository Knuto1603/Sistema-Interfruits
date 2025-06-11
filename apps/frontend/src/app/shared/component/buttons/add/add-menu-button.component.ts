import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

@Component({
	// eslint-disable-next-line @angular-eslint/component-selector
	selector: 'add-menu-button',
	imports: [MatIconModule, MatMenuModule],
	templateUrl: './add-menu-button.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddMenuButtonComponent {}
