import {Component, DestroyRef, inject, OnInit, signal, viewChild} from "@angular/core";
import {
  ActiveButtonComponent,
  AddButtonComponent, DeleteButtonComponent, EditButtonComponent,
  ExportButtonComponent,
  SearchInputComponent
} from "@shared/component";
import {LoadingComponent} from "@shared/component/loading-screen/loading-screen.component";
import {NgClass, NgIf} from "@angular/common";
import {RouterLink} from "@angular/router";
import {AlertService} from "@core/alert/alert.service";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort, MatSortHeader} from "@angular/material/sort";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {CamphnaRepositoryService} from "@modules/campaña/repository/camphna-repository.service";
import {finalize, merge, switchMap, tap} from "rxjs";
import {DeleteConfirmationDirective} from "@shared/directive/delete-confirmation.directive";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow, MatRowDef, MatTable
} from "@angular/material/table";
import {PAGINATION} from "@shared/app.constants";


@Component({
    selector: 'app-campanha-list',
  imports: [
    AddButtonComponent,
    ExportButtonComponent,
    LoadingComponent,
    NgIf,
    RouterLink,
    SearchInputComponent,
    ActiveButtonComponent,
    DeleteButtonComponent,
    DeleteConfirmationDirective,
    EditButtonComponent,
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatPaginator,
    MatRow,
    MatRowDef,
    MatSort,
    MatSortHeader,
    MatTable,
    NgClass,
    MatHeaderCellDef

  ],
    templateUrl: './campahna-list.component.html',
    standalone: true
  })
export class CampanhaListComponent implements OnInit {
  private campahnRepository: CamphnaRepositoryService = inject(CamphnaRepositoryService);
  private alertService: AlertService = inject(AlertService);
  private destroyRef: DestroyRef = inject(DestroyRef);

  public campahnas = this.campahnRepository.campahnas;

  paginator = viewChild.required<MatPaginator>(MatPaginator);
  sort = viewChild.required<MatSort>(MatSort);
  public isLoading = signal<boolean>(false);
  public searchInput = signal<string>('');
  public pagination = this.campahnRepository.pagination;

  public displayedColumns: string[] = ['nombre', 'descripcion', 'fechaInicio', 'frutaNombre','nombreCompleto', 'isActive', 'actions'];
  public paginationSizes: number[] = PAGINATION.SIZES;


  public ngOnInit(): void {
    this.isLoading.set(true);

    this.campahnRepository.getAll()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false))
      ).subscribe();
  }

  public ngAfterViewInit(): void {
    merge(this.paginator().page, this.sort().sortChange)
      .pipe(
        takeUntilDestroyed(this.destroyRef),

        switchMap(() => {
          this.isLoading.set(true);

          return this.campahnRepository.getAll(
            this.paginator().pageIndex,
            this.paginator().pageSize,
            this.searchInput(),
            this.sort().active,
            this.sort().direction
          );
        }),
        tap(() => {
          this.isLoading.set(false);

        })
      )
      .subscribe();
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

