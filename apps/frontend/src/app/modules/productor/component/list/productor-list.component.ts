import {AfterViewInit, Component, DestroyRef, inject, OnInit, signal, viewChild} from '@angular/core';
import {AlertService} from "@core/alert/alert.service";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort, MatSortHeader} from "@angular/material/sort";
import {PAGINATION} from "@shared/app.constants";
import {ProductorRepositoryService} from "@modules/productor/repository/productor-repository.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {finalize, merge, switchMap, tap} from "rxjs";
import {
  ActiveButtonComponent,
  AddButtonComponent,
  DeleteButtonComponent,
  EditButtonComponent,
  ExportButtonComponent, SearchInputComponent
} from "@shared/component";
import {DeleteConfirmationDirective} from "@shared/directive/delete-confirmation.directive";
import {LoadingComponent} from "@shared/component/loading-screen/loading-screen.component";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow, MatRowDef, MatTable
} from "@angular/material/table";
import {NgClass, NgIf} from "@angular/common";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-productor-list',
  imports: [
    ActiveButtonComponent,
    AddButtonComponent,
    DeleteButtonComponent,
    DeleteConfirmationDirective,
    EditButtonComponent,
    ExportButtonComponent,
    LoadingComponent,
    MatCell,
    MatCellDef,
    MatHeaderCellDef,
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
    NgIf,
    RouterLink,
    SearchInputComponent,
    NgClass
  ],
  templateUrl: './productor-list.component.html',
  styleUrl: './productor.component.scss'
})
export class ProductorListComponent implements OnInit, AfterViewInit{
  private productorRepository: ProductorRepositoryService = inject(ProductorRepositoryService);
  private alertService: AlertService = inject(AlertService);
  private destroyRef: DestroyRef = inject(DestroyRef);

  public productores = this.productorRepository.productores;

  paginator = viewChild.required<MatPaginator>(MatPaginator);
  sort = viewChild.required<MatSort>(MatSort);
  public isLoading = signal<boolean>(false);
  public searchInput = signal<string>('');
  public pagination = this.productorRepository.pagination;

  public displayedColumns: string[] = ['position', 'codigo', 'name', 'clp', 'isActive', 'actions'];
  public paginationSizes: number[] = PAGINATION.SIZES;

  public ngOnInit(): void {
    this.isLoading.set(true);

    this.productorRepository.getAll()
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

          return this.productorRepository.getAll(
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
    this.productorRepository
      .getAll(0, this.paginator().pageSize, event, this.sort().active, this.sort().direction)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe();
  }

  public changeActive(id: string, active: boolean): void {
    this.productorRepository.changeActive(id, active).subscribe((message) => {
      this.alertService.send(message, 'success');
    });
  }

  public delete(id: string): void {
    this.productorRepository
      .delete(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((message) => {
        this.alertService.send(message, 'warning');
      });
  }

  public download(): void {
    this.productorRepository.download({
      search: this.searchInput() || '',
      sort: this.sort().active || 'name',
      order: this.sort().direction || 'asc',
    });
  }

}
