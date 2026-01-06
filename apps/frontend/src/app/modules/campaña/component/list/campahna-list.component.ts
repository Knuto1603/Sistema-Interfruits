import {Component, DestroyRef, inject, OnInit, signal, viewChild} from "@angular/core";
import {AddButtonComponent, ExportButtonComponent, SearchInputComponent} from "@shared/component";
import {LoadingComponent} from "@shared/component/loading-screen/loading-screen.component";
import {NgIf} from "@angular/common";
import {RouterLink} from "@angular/router";
import {AlertService} from "@core/alert/alert.service";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {CamphnaRepositoryService} from "@modules/campaña/repository/camphna-repository.service";
import {finalize} from "rxjs";


@Component({
    selector: 'app-campanha-list',
  imports: [
    AddButtonComponent,
    ExportButtonComponent,
    LoadingComponent,
    NgIf,
    RouterLink,
    SearchInputComponent

  ],
    templateUrl: './campahna-list.component.html',
    standalone: true
  })
export class CampanhaListComponent implements OnInit {
  private campahnRepository: CamphnaRepositoryService = inject(CamphnaRepositoryService);
  private alertService: AlertService = inject(AlertService);
  private destroyRef: DestroyRef = inject(DestroyRef);
  public pagination = this.campahnRepository.pagination;




  paginator = viewChild.required<MatPaginator>(MatPaginator);
  sort = viewChild.required<MatSort>(MatSort);
  public isLoading = signal<boolean>(false);
  public searchInput = signal<string>('');

  public ngOnInit(): void {
    // Aquí puedes inicializar cualquier cosa que necesites al cargar el componente
    console.log('CampanhaListComponent initialized');
  }


  public searchInputChanged(event: string): void {
    this.searchInput.set(event);
    this.isLoading.set(true);
    this.campahnRepository
      .getAll(0, this.paginator().pageSize, event, this.sort().active, this.sort().direction)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe();
  }

  public changeActive(id: string, active: boolean): void {
    this.campahnRepository.changeActive(id, active).subscribe((message) => {
      this.alertService.send(message, 'success');
    });
  }

  public delete(id: string): void {
    this.campahnRepository
      .delete(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((message) => {
        this.alertService.send(message, 'warning');
      });
  }

  public download(): void {
    this.campahnRepository.download({
      search: this.searchInput() || '',
      sort: this.sort().active || 'name',
      order: this.sort().direction || 'asc',
    });
  }
}

