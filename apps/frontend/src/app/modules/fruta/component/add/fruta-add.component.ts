import {Component, DestroyRef, inject, OnInit, signal} from "@angular/core";
import {FrutaRepositoryService} from "@modules/fruta/repository/fruta-repositiry.service";
import { FormBuilder, ReactiveFormsModule, UntypedFormGroup, Validators } from '@angular/forms';
import {AlertService} from "@core/alert/alert.service";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {Fruta} from "@modules/fruta/interface/fruta.interface";
import {CloseButtonComponent} from "@shared/component/buttons/close/close-button.component";
import {DebounceClickDirective} from "@shared/directive/debounce-click.directive";
import {MatError, MatFormField, MatInput, MatLabel} from "@angular/material/input";
import {MatSlideToggle} from "@angular/material/slide-toggle";
import {SaveButtonComponent} from "@shared/component";
import {MatOption} from "@angular/material/core";
import {MatSelect} from "@angular/material/select";

@Component({
    selector: 'app-fruta-add',
    templateUrl: './fruta-add.component.html',
    imports: [
      CloseButtonComponent,
      DebounceClickDirective,
      MatError,
      MatFormField,
      MatInput,
      MatLabel,
      MatOption,
      MatSelect,
      MatSlideToggle,
      SaveButtonComponent,
      RouterLink,
      ReactiveFormsModule
    ],
    styles: []
  }
)
export class FrutaAddComponent implements OnInit{

  private frutaRepository: FrutaRepositoryService = inject(FrutaRepositoryService);
  private formBuilder: FormBuilder = inject(FormBuilder);
  private alertService: AlertService = inject(AlertService);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private router: Router = inject(Router);
  private destroyRef: DestroyRef = inject(DestroyRef);

  readonly saving = signal(false);

  public frutaForm: UntypedFormGroup;

  ngOnInit(): void {
    this.frutaForm = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      codigo: ['', [Validators.required,Validators.maxLength(3)]],
      isActive: [true],
    })
  }

  public get form(){
    return this.frutaForm.controls;
  }

  public save(): void{
    this.saving.set(true);
    const item: Fruta = this.frutaForm.getRawValue();

    this.frutaRepository.create(item).subscribe({
      next: (message) => {
        this.saving.set(false);
        this.alertService.send(message, 'success');
        this.router.navigate(['../'], { relativeTo: this.activatedRoute }).then();
      },
      error: () => {
        this.saving.set(false);
      },
    })
  }

  get isActiveControl() {
    return this.frutaForm.get('isActive');
  }

  }
