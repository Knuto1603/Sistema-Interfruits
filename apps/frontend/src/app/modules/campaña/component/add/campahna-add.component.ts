import {Component, OnInit} from "@angular/core";


@Component({
    selector: 'app-campanha-list',
    imports:[

    ],
    templateUrl: './campahna-add.component.html',
    standalone: true
  })
export class CampanhaAddComponent implements OnInit {
  public ngOnInit(): void {
    // Aquí puedes inicializar cualquier cosa que necesites al cargar el componente
    console.log('CampanhaAddComponent initialized');
  }

}
