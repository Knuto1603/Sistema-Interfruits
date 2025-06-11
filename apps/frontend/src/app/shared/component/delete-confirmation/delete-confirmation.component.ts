import { ChangeDetectionStrategy, Component, inject, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Subject } from 'rxjs';

import { ConfirmationService } from '../../service/confirmation.service';

@Component({
	// eslint-disable-next-line @angular-eslint/component-selector
	selector: 'delete-confirmation',
	imports: [MatButtonModule, MatIconModule],
	templateUrl: './delete-confirmation.component.html',
	styles: [],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteConfirmationComponent {
	private confirmationService: ConfirmationService = inject(ConfirmationService);
	private deletedData = new Subject<{ delete: boolean; id: string }>();

	@Input({ required: true }) public id: string;
	@Input() public type: 'button' | 'icon' = 'button';

	@Output() private dataDeleted = this.deletedData.asObservable();

	delete(): void {
		this.confirmationService.delete().subscribe((result) => {
			this.deletedData.next({
				delete: result === 'confirmed',
				id: this.id,
			});
		});
	}
}
