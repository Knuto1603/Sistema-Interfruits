import { Injectable, signal } from '@angular/core';
import {Campanha} from "@modules/campaña/interface/campaña.interface";


@Injectable({
  providedIn: 'root'
})
export class ContextoService {
  // Usamos signals para que la UI reaccione al cambio de campaña
  private _campanhaSeleccionada = signal<Campanha | null>(this.getStoredCampanha());

  constructor() {}

  /**
   * Obtener la campaña actual
   */
  get campanha() {
    return this._campanhaSeleccionada;
  }

  /**
   * Guardar la campaña seleccionada y persistirla
   */
  setCampanha(campanha: Campanha): void {
    localStorage.setItem('selected_campanha_id', campanha.id.toString());
    localStorage.setItem('selected_campanha_data', JSON.stringify(campanha));
    this._campanhaSeleccionada.set(campanha);
  }

  /**
   * Obtener solo el ID para los headers
   */
  getCampanhaId(): string | null {
    return localStorage.getItem('selected_campanha_id');
  }

  private getStoredCampanha(): Campanha | null {
    const data = localStorage.getItem('selected_campanha_data');
    return data ? JSON.parse(data) : null;
  }

  logout(): void {
    localStorage.removeItem('selected_campanha_id');
    localStorage.removeItem('selected_campanha_data');
    this._campanhaSeleccionada.set(null);
  }
}
