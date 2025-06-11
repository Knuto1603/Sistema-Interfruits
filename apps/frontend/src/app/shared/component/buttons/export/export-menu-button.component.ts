import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

@Component({
	// eslint-disable-next-line @angular-eslint/component-selector
	selector: 'export-menu-button',
	imports: [MatIconModule, MatMenuModule],
	templateUrl: './export-menu-button.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExportMenuButtonComponent {
	@Input() label: string = 'download';
}
