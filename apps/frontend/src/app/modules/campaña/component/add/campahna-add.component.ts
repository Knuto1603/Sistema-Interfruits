import {Component, DestroyRef, inject, OnInit, signal} from "@angular/core";
import {CamphnaRepositoryService} from "@modules/campaña/repository/camphna-repository.service";
import {FormBuilder, ReactiveFormsModule, UntypedFormGroup} from "@angular/forms";
import {AlertService} from "@core/alert/alert.service";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {FrutaShared, FrutasResponse} from "@modules/fruta/interface/fruta.interface";
import {FrutaRepositoryService} from "@modules/fruta/repository/fruta-repositiry.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import { Campanha } from "@modules/campaña/interface/campaña.interface";
import {MatSelect, MatSelectModule} from "@angular/material/select";
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatInputModule} from "@angular/material/input";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatMenuModule} from "@angular/material/menu";
import {CloseButtonComponent} from "@shared/component/buttons/close/close-button.component";
import {DebounceClickDirective} from "@shared/directive/debounce-click.directive";
import {SaveButtonComponent} from "@shared/component";
import {MatOptionModule} from "@angular/material/core";
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import { formatDate } from "@angular/common";




@Component({
    selector: 'app-campanha-list',
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
    MatDatepickerModule,
    MatNativeDateModule,

  ],
    templateUrl: './campahna-add.component.html',
    standalone: true
  })
export class CampanhaAddComponent implements OnInit {

  private campahnaRepository: CamphnaRepositoryService = inject(CamphnaRepositoryService);
  private frutaRepository: FrutaRepositoryService = inject(FrutaRepositoryService);
  private formBuilder: FormBuilder = inject(FormBuilder);
  private alertService: AlertService = inject(AlertService);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private router: Router = inject(Router);
  private destroyRef: DestroyRef = inject(DestroyRef);

  readonly frutas = signal<FrutaShared[]>([]);
  readonly saving = signal(false);

  public campanhaForm: UntypedFormGroup;
  ngOnInit(): void {
    this.campanhaForm = this.formBuilder.group({
        nombre: [''],
        descripcion: [''],
        fechaInicio: [''],
        frutaId: [null],
        isActive: [true],
      });

    this.frutaRepository
      .getShared()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((frutas) => {
          this.frutas.set(frutas);
      });
  }

  public get form() {
    return this.campanhaForm.controls;
  }

  public save(): void {
    this.saving.set(true);
    const item: Campanha = this.campanhaForm.getRawValue();
    const dateStart: Date = this.campanhaForm.get('fechaInicio')?.value;
    item.fechaInicio = dateStart ? formatDate(dateStart, 'yyyy-MM-dd', 'en-US') : null;

    this.campahnaRepository
      .create(item)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (message: string) => {
          this.alertService.send('success');
          this.router.navigate(['../'], { relativeTo: this.activatedRoute}).then();
        },
        error: (error: any) => {
          this.saving.set(false);
        },
      });
  }

  get isActiveControl() {
    return this.campanhaForm.get('isActive');
  }

}
