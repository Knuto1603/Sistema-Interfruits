import { Component, DestroyRef, inject, OnInit, signal } from "@angular/core";
import { ProductorRepositoryService } from "@modules/productor/repository/productor-repository.service";
import { FormBuilder, ReactiveFormsModule, UntypedFormGroup, Validators } from "@angular/forms";
import { AlertService } from "@core/alert/alert.service";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { CloseButtonComponent } from "@shared/component/buttons/close/close-button.component";
import { DebounceClickDirective } from "@shared/directive/debounce-click.directive";
import { SaveButtonComponent } from "@shared/component";
import { MatOptionModule } from "@angular/material/core";
import { MatSelectModule } from "@angular/material/select";
import { AutoFormatDirective } from "@core/format/auto-format.directive";
import { ContextoService } from "@core/context/contexto.service";
import { toObservable } from "@angular/core/rxjs-interop";
import {Campanha} from "@modules/campaña/interface/campaña.interface";

@Component({
  selector: 'app-productor-add',
  standalone: true,
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
    AutoFormatDirective,
  ],
  templateUrl: './productor-add.component.html',
})
export class ProductorAddComponent implements OnInit {

  private productorRepository: ProductorRepositoryService = inject(ProductorRepositoryService);
  private formBuilder: FormBuilder = inject(FormBuilder);
  private alertService: AlertService = inject(AlertService);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private router: Router = inject(Router);
  private contexto: ContextoService = inject(ContextoService);

  readonly saving = signal(false);
  public productorForm: UntypedFormGroup;

  ngOnInit(): void {
    this.productorForm = this.formBuilder.group({
      codigo: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(4)]],
      nombre: ['', [Validators.required]],
      clp: ['', [Validators.required, Validators.pattern(/^\d{3}-\d{5}-\d{2}$/)]],
      mtdAnastrepha: [0, [Validators.required]],
      mtdCeratitis: [0, [Validators.required]],
      // periodoId eliminado según MER 3.4
      frutaId: ['', [Validators.required]],
      campahnaId: ['', [Validators.required]], // Nuevo: El productor se vincula a la campaña
      isActive: [true],
    });

    this.getProductorCode();

    // Suscribirse al cambio de campaña (usando el signal del ContextoService)
    toObservable(this.contexto.campanha).subscribe({
      next: (campahna: Campanha | null) => {
        if (campahna) {
          console.log('Campaña activa detectada:', campahna.nombre);
          this.productorForm.patchValue({
            campahnaId: campahna.id,
            frutaId: campahna.frutaId // La fruta viene definida por la campaña
          });
        } else {
          this.alertService.send('Debe seleccionar una campaña de trabajo antes de agregar productores.');
        }
      },
      error: (error) => this.alertService.send(error)
    });
  }

  public get form() {
    return this.productorForm.controls;
  }

  public save(): void {
    if (this.productorForm.invalid) {
      this.alertService.send('Por favor, complete todos los campos obligatorios.');
      return;
    }

    this.saving.set(true);
    const item = this.productorForm.getRawValue();

    this.productorRepository
      .create(item)
      .subscribe({
        next: () => {
          this.alertService.send('Productor registrado y vinculado a la campaña correctamente');
          this.router.navigate(['../'], { relativeTo: this.activatedRoute });
        },
        error: (error) => {
          this.alertService.send(error);
          this.saving.set(false);
        },
        complete: () => this.saving.set(false)
      });
  }

  get isActiveControl() {
    return this.productorForm.get('isActive');
  }

  public getProductorCode(): void {
    this.productorRepository.getLastCode().subscribe({
      next: (response) => {
        const codigoNuevo = response
          ? (parseInt(response, 10) + 1).toString().padStart(4, '0')
          : '0001';
        this.productorForm.patchValue({ codigo: codigoNuevo });
      },
      error: (error) => this.alertService.send(error)
    });
  }
}
