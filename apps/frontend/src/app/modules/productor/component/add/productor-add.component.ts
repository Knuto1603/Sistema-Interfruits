import {Component, DestroyRef, inject, OnInit, signal} from "@angular/core";
import {ProductorRepositoryService} from "@modules/productor/repository/productor-repository.service";
import {FormBuilder, ReactiveFormsModule, UntypedFormGroup, Validators} from "@angular/forms";
import { AlertService } from "@core/alert/alert.service";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatMenuModule} from "@angular/material/menu";
import {CloseButtonComponent} from "@shared/component/buttons/close/close-button.component";
import {DebounceClickDirective} from "@shared/directive/debounce-click.directive";
import {SaveButtonComponent} from "@shared/component";
import {MatOptionModule} from "@angular/material/core";
import {MatSelectModule} from "@angular/material/select";
import {AutoFormatDirective} from "@core/format/auto-format.directive";
import {ContextoService} from "@core/context/contexto.service";

@Component({
  selector: 'app-productor-add',
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
  private destroyRef: DestroyRef = inject(DestroyRef);
  private contexto: ContextoService = inject(ContextoService);

  readonly saving = signal(false);


  public productorForm: UntypedFormGroup;

    ngOnInit(): void {
        this.productorForm = this.formBuilder.group({
            codigo: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(4)]],
            nombre: ['', []],
            clp: ['', [Validators.required, Validators.pattern(/^\d{3}-\d{5}-\d{2}$/)]],
            mtdAnastrepha: ['', [Validators.required, Validators.pattern(/^\d.\d{4}$/)]],
            mtdCeratitis: ['', [Validators.required, Validators.pattern(/^\d.\d{4}$/)]],
            periodoId: ['', [Validators.required]],
            frutaId: ['', [Validators.required]],
            isActive: [true],
        })
      this.getProductorCode();

      this.contexto.contexto$.subscribe({
          next: (contexto: { periodoId: string; frutaId: string; }) => {
              if (contexto) {
                console.log('Contexto actual:', contexto);
                  this.productorForm.patchValue({
                      periodoId: contexto.periodoId,
                      frutaId: contexto.frutaId
                  });
              } else {
                  this.alertService.send('No se ha establecido un contexto válido');
              }
          },
          error: (error: string) => {
              this.alertService.send(error);
          }
      });

    }


    public get form() {
        return this.productorForm.controls;
    }

    public save(): void {
        this.saving.set(true);
        const item = this.productorForm.getRawValue();
        this.productorRepository
            .create(item)
            .subscribe({
                next: (response) => {
                    this.alertService.send('Productor creado correctamente');
                    this.router.navigate(['../'], { relativeTo: this.activatedRoute }).then();
                },
                error: (error) => {
                    this.alertService.send(error);
                },
                complete: () => {
                    this.saving.set(false);
                }
            });
    }

    get isActiveControl() {
        return this.productorForm.get('isActive');
    }

    public getProductorCode(): void {
        this.productorRepository.getLastCode().subscribe({
            next: (response) => {
              if(response) {
                const codigoActual = parseInt(response, 10);
                const codigoNuevo = (codigoActual + 1).toString().padStart(4, '0');
                this.productorForm.patchValue({ codigo: codigoNuevo });
                console.log('Código incrementado:', codigoNuevo);
              } else {
                // Si no hay código previo, asignar 0001 como primer código
                this.productorForm.patchValue({ codigo: '0001' });
                console.log('Primer código asignado: 0001');
              }

            },
            error: (error) => {
                this.alertService.send(error);
            }
        });
    }

}
