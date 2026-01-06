// services/contexto.service.ts
import {inject, Injectable, signal} from "@angular/core";
import {BehaviorSubject, map, tap} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environment} from "@environments/environment";
import {FrutaShared} from "@modules/fruta/interface/fruta.interface";
import { FrutasSharedService } from "@modules/fruta/repository/futa-shared.service";
import {PeriodosSharedService} from "@modules/periodo/repository/periodo-shared.service";
import { switchMap, take } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class ContextoService {

  private urlContextApi: string = `${environment.apiCore}/api/contexto`;

  private contextoActual = new BehaviorSubject<any>(null);

  private frutaSharedService = inject(FrutasSharedService);
  private periodoSharedService = inject(PeriodosSharedService);

  constructor(private http: HttpClient) {
    this.cargarContextoDesdeStorage();
  }


  get contexto$() {
    return this.contextoActual.asObservable();
  }

  get getContextoActual() {
    return this.contextoActual.value;
  }

  establecerContexto(periodoId: string, frutaId: string) {
      const contexto = { periodoId, frutaId };
      this.contextoActual.next(contexto);
      localStorage.setItem('contexto', JSON.stringify(contexto));
  }


  private cargarContextoDesdeStorage() {
    const contexto = localStorage.getItem('contexto');
    if (contexto) {
      this.contextoActual.next(JSON.parse(contexto));
    }
  }


  getPeriodos() {
    return this.periodoSharedService.getDataLocal();
  }


  getFrutas() {
    return this.frutaSharedService.getDataLocal();
  }

  getNombreFrutaPorId(frutaId: string) {
    return this.getFrutas()
      .pipe(
        map(frutas => frutas.find(f => f.id === frutaId)),
        tap(fruta => {
          if (!fruta) {
            console.warn(`Fruta con ID ${frutaId} no encontrada.`);
          }
        }),
        map(fruta => fruta ? fruta.nombre : null)
      );
  }

  getNombrePeriodoPorId(periodoId: string) {
    return this.getPeriodos()
      .pipe(
        switchMap(periodos => {
          const periodo = periodos.find(p => p.id === periodoId);
          if (!periodo) {
            console.warn(`Periodo con ID ${periodoId} no encontrado.`);
            return [null];
          }
          return [periodo.nombre];
        })
      );
  }


  getContextoParaRequest(): any {
    const contexto = this.contextoActual.value;
    return contexto ? {
      periodoId: contexto.periodoId,
      frutaId: contexto.frutaId
    } : null;
  }

}
