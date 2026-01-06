import {Component, OnInit} from "@angular/core";


@Component({
    selector: 'app-campanha-list',
    imports:[

    ],
    templateUrl: './campahna-edit.component.html',
    standalone: true
  })
export class CampanhaEditComponent implements OnInit {
  public ngOnInit(): void {
    // Aquí puedes inicializar cualquier cosa que necesites al cargar el componente
    console.log('CampanhaEditComponent initialized');
  }

}
