import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {MatProgressSpinner,} from '@angular/material/progress-spinner';


@Component({
	// eslint-disable-next-line @angular-eslint/component-selector
	selector: 'update-button',
  imports: [MatButtonModule, MatIconModule, MatProgressSpinner],
	templateUrl: './update-button.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdateButtonComponent {
	@Input() disabled: boolean = false;
  @Input() loading: boolean = false;


  @HostBinding('style.pointer-events') get pEvents(): string {
		return this.disabled ? 'none' : 'auto';
	}
}
