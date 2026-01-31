import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { ContextoService } from './contexto.service';
import { Router } from '@angular/router';
import { ModalModule, ButtonModule, ListGroupModule } from '@coreui/angular';

@Component({
  selector: 'app-selector-context',
  standalone: true,
  imports: [CommonModule, ModalModule, ButtonModule, ListGroupModule],
  template: 'selector-context.component.html'
})
export class SelectorContextComponent implements OnInit {
  private http = inject(HttpClient);
  private contexto = inject(ContextoService);
  private router = inject(Router);
  private urlApi: string = `${environment.apiCore}/api/campahnas`;

  campahnas: any[] = [];
  visible = false;

  ngOnInit() {
    // Si no hay campaña elegida, mostramos el modal
    if (!this.contexto.getCampanhaId()) {
      this.cargarCampahnas();
    }
  }

  cargarCampahnas() {
    this.http.get<any[]>(this.urlApi).subscribe(res => {
      this.campahnas = res;
      this.visible = true;
    });
  }

  seleccionar(campahna: any) {
    this.contexto.setCampanha(campahna);
    this.visible = false;
    // Redirigir al dashboard o refrescar la página actual
    window.location.reload();
  }

  handleVisibleChange(event: boolean) {
    this.visible = event;
  }
}
