import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AlertService } from '@core/alert/alert.service';
import { SaveButtonComponent } from '@shared/component';
import { CloseButtonComponent } from '@shared/component/buttons/close/close-button.component';
import { DebounceClickDirective } from '@shared/directive/debounce-click.directive';

import { Parametro, ParametroParentResponse } from '../../interface/parametro.interface';
import { ParametroRepositoryService } from '../../repository/parametro-repository.service';

@Component({
	selector: 'app-parametro-add',
	imports: [
		RouterLink,
		MatFormFieldModule,
		MatInputModule,
		MatSlideToggleModule,
		ReactiveFormsModule,
		MatButtonModule,
		MatIconModule,
		MatMenuModule,
		CloseButtonComponent,
		DebounceClickDirective,
		SaveButtonComponent,
		MatOptionModule,
		MatSelectModule,
	],
	templateUrl: './parametro-add.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParametroAddComponent implements OnInit {
	private parametroRepository: ParametroRepositoryService = inject(ParametroRepositoryService);
	private formBuilder: FormBuilder = inject(FormBuilder);
	private alertService: AlertService = inject(AlertService);
	private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
	private router: Router = inject(Router);
	private destroyRef: DestroyRef = inject(DestroyRef);

	readonly parents = signal<ParametroParentResponse[]>([]);
	readonly saving = signal(false);

	public parametroForm: UntypedFormGroup;

	ngOnInit(): void {
		this.parametroForm = this.formBuilder.group({
			parentId: [null],
			name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
			alias: ['', [Validators.maxLength(6)]],
			value: [null, [Validators.maxLength(12), Validators.pattern('^-?(0|[1-9]\\d*)(\\.\\d+)?$')]],
			isActive: [true],
		});

		this.parametroRepository
			.getParents()
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe((parents) => {
				this.parents.set(parents);
			});
	}

	public get form() {
		return this.parametroForm.controls;
	}

	public save(): void {
		this.saving.set(true);
		const item: Parametro = this.parametroForm.getRawValue();

		this.parametroRepository.create(item).subscribe({
			next: (message) => {
				this.saving.set(false);
				this.alertService.send(message, 'success');
				this.router.navigate(['../'], { relativeTo: this.activatedRoute }).then();
			},
			error: () => {
				this.saving.set(false);
			},
		});
	}

  get isActiveControl() {
    return this.parametroForm.get('isActive');
  }

}
