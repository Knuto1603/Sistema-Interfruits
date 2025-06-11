import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
	// eslint-disable-next-line @angular-eslint/component-selector
	selector: 'export-button',
	imports: [MatIconModule, MatButtonModule],
	templateUrl: './export-button.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExportButtonComponent {
	@Input() label: string = 'download';
}
