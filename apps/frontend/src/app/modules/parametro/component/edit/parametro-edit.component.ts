import {ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input, OnInit, signal} from '@angular/core';
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
import { UpdateButtonComponent } from '@shared/component';
import { CloseButtonComponent } from '@shared/component/buttons/close/close-button.component';
import { DeleteMenuButtonComponent } from '@shared/component/buttons/delete/delete-menu-button.component';
import { MenuButtonComponent } from '@shared/component/buttons/menu/menu-button.component';
import { DebounceClickDirective } from '@shared/directive/debounce-click.directive';
import { DeleteConfirmationDirective } from '@shared/directive/delete-confirmation.directive';

import { Parametro, ParametroParentResponse } from '../../interface/parametro.interface';
import { ParametroRepositoryService } from '../../repository/parametro-repository.service';

@Component({
	selector: 'app-parametro-edit',
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
		MenuButtonComponent,
		UpdateButtonComponent,
		DeleteMenuButtonComponent,
		DebounceClickDirective,
		DeleteConfirmationDirective,
		MatOptionModule,
		MatSelectModule,
	],
	templateUrl: './parametro-edit.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParametroEditComponent implements OnInit {
	private parametroRepository: ParametroRepositoryService = inject(ParametroRepositoryService);
	private formBuilder: FormBuilder = inject(FormBuilder);
	private alertService: AlertService = inject(AlertService);
	private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
	private router: Router = inject(Router);
	private destroyRef: DestroyRef = inject(DestroyRef);

	readonly id = signal<string>('');
	readonly parametro = signal<Parametro|null>(null);
	readonly parents = signal<ParametroParentResponse[]>([]);
	readonly saving = signal(false);


  // Inicializar formulario con valores predeterminados
  public parametroForm: UntypedFormGroup = this.formBuilder.group({
    id: [null],
    parent: [null],
    name: [null, [Validators.required, Validators.minLength(2)]],
    alias: [null, [Validators.required, Validators.minLength(4)]],
    value: [null],
    isActive: [true],
  });

  constructor() {
    // Obtener datos del resolver y actualizar el formulario cuando estén disponibles
    effect(() => {
      if (this.parametro()) {
        const parametro = this.parametro();
        this.parametroForm.patchValue({
          id: parametro?.id,
          parent: parametro?.parentName,
          name: parametro?.name,
          alias: parametro?.alias,
          value: parametro?.value,
          isActive: parametro?.isActive,
        });
        console.log('Datos del usuario cargados en el formulario:', parametro);
      }
    });
  }

	ngOnInit(): void {

    this.parametroRepository
      .getParents()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((parents) => {
        const items = parents.filter((parent) => parent.id !== this.id());
        this.parents.set(items);
      });


    const routeData = this.activatedRoute.snapshot.data;
    if (routeData['parametro']) {
      this.parametro.set(routeData['parametro']);
    }

    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (id) {
      this.id.set(id);
    }

    this.activatedRoute.data.subscribe((data) => {
      // Desactivar la pantalla de carga
      //this.userComponent.isLoading.set(false);

    });


	}

	public get form() {
		return this.parametroForm.controls;
	}

	public save(): void {
		this.saving.set(true);
		const item: Parametro = this.parametroForm.getRawValue();

		this.parametroRepository.update(item.id, item).subscribe({
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

	public delete(): void {
		const item: Parametro = this.parametroForm.getRawValue();
		this.parametroRepository.delete(item.id).subscribe((message) => {
			this.alertService.send(message, 'warning');
			this.router.navigate(['../'], { relativeTo: this.activatedRoute }).then();
		});
	}

  get isActiveControl() {
    return this.parametroForm.get('isActive');
  }

}
