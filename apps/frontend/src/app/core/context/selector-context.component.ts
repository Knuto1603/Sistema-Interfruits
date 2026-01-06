// components/selector-contexto/selector-contexto.component.ts
import {Component, DestroyRef, inject, OnInit, signal} from "@angular/core";
import {FormsModule} from "@angular/forms";
import {NgForOf, NgIf} from "@angular/common";
import {ContextoService} from "@core/context/contexto.service";
import {FrutaShared, FrutasResponse} from "@modules/fruta/interface/fruta.interface";
import {PeriodoShared} from "@modules/periodo/interface/periodo.interface";
import {LoadingComponent} from "@shared/component/loading-screen/loading-screen.component";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-selector-contexto',
  imports: [
    FormsModule,
    NgForOf,
    NgIf,
    LoadingComponent
  ],
  templateUrl: './selector-context.component.html',
})
export class SelectorContextoComponent implements OnInit {

  private destroyRef: DestroyRef = inject(DestroyRef);
  private contextoService = inject(ContextoService);

  public periodos = signal<PeriodoShared[]>([]);
  public frutas = signal<FrutaShared[]>([]);
  public isLoading = signal<boolean>(false);


  periodoSeleccionado = '';
  frutaSeleccionada = '';
  contextoActual: any;

  periodoNombre: string;
  frutaNombre: string;

  ngOnInit() {

    this.cargarPeriodos();
    this.cargarFrutas();

    this.contextoService.contexto$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(contexto => {
      this.contextoActual = contexto;
      if (contexto) {
        this.periodoSeleccionado = contexto.periodoId;
        this.frutaSeleccionada = contexto.frutaId;
      }
      this.isLoading.set(false);
    });

    this.contextoService.getNombreFrutaPorId(this.frutaSeleccionada)
      .subscribe(nombreFruta => {
        console.log(nombreFruta);
        this.frutaNombre = nombreFruta || 'Todas las frutas';
      });

    this.contextoService.getNombrePeriodoPorId(this.periodoSeleccionado)
      .subscribe(nombrePeriodo => {
        console.log(nombrePeriodo);
        this.periodoNombre = nombrePeriodo || 'Todos los periodos';
      });
  }

  cargarPeriodos() {
    this.contextoService.getPeriodos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(
        periodos =>
        {
          this.periodos.set(periodos);
        }
    );
  }

  cargarFrutas() {
    this.contextoService.getFrutas()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(frutas => {
      this.frutas.set(frutas);
    });
  }

  aplicarContexto() {
    this.isLoading.set(true);
    if(this.periodoSeleccionado == 'all' || this.frutaSeleccionada == 'all') {
      this.periodoSeleccionado = '';
      this.frutaSeleccionada = '';
    };
    this.contextoService.establecerContexto(
      this.periodoSeleccionado,
      this.frutaSeleccionada
    );
  }
}
