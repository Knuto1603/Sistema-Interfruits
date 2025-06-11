import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

@Component({
	// eslint-disable-next-line @angular-eslint/component-selector
	selector: 'delete-menu-button',
	imports: [MatIconModule, MatMenuModule],
	templateUrl: './delete-menu-button.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteMenuButtonComponent {}
