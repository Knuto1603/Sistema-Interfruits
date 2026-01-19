import {CommonModule} from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {FrutaRepositoryService} from "@modules/fruta/repository/fruta-repositiry.service";
import {PAGINATION} from '@shared/app.constants';
import {finalize, merge, switchMap, tap} from 'rxjs';
import {MatSort, MatSortModule} from "@angular/material/sort";
import {MatPaginator, MatPaginatorModule} from "@angular/material/paginator";
import {AlertService} from '@core/alert/alert.service';
import {LoadingComponent} from "@shared/component/loading-screen/loading-screen.component";
import {
  ActiveButtonComponent,
  AddButtonComponent,
  DeleteButtonComponent,
  EditButtonComponent,
  ExportButtonComponent,
  SearchInputComponent
} from '@shared/component';
import { MatTableModule } from '@angular/material/table';
import { DeleteConfirmationDirective } from '@shared/directive/delete-confirmation.directive';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-fruta-list',
  imports: [
    CommonModule,
    AddButtonComponent,
    EditButtonComponent,
    ExportButtonComponent,
    MatPaginatorModule,
    MatSortModule,
    MatTableModule,
    SearchInputComponent,
    RouterLink,
    DeleteButtonComponent,
    DeleteConfirmationDirective,
    ActiveButtonComponent,
    LoadingComponent,
  ],
  templateUrl: './fruta-list.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FrutaListComponent implements OnInit, AfterViewInit {
  private frutaRepository: FrutaRepositoryService = inject(FrutaRepositoryService);
  private alertService: AlertService = inject(AlertService);
  private destroyRef: DestroyRef = inject(DestroyRef);

  public frutas = this.frutaRepository.frutas;

  paginator = viewChild.required<MatPaginator>(MatPaginator);
  sort = viewChild.required<MatSort>(MatSort);
  public isLoading = signal<boolean>(false);
  public searchInput = signal<string>('');
  public pagination = this.frutaRepository.pagination;

  public displayedColumns: string[] = [ 'nombre', 'codigo', 'isActive', 'actions'];
  public paginationSizes: number[] = PAGINATION.SIZES;

  public ngOnInit(): void {
    this.isLoading.set(true);

    this.frutaRepository.getAll()
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

          return this.frutaRepository.getAll(
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
    this.frutaRepository
      .getAll(0, this.paginator().pageSize, event, this.sort().active, this.sort().direction)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe();
  }

  public changeActive(id: string, active: boolean): void {
    this.isLoading.set(true);
    this.frutaRepository.changeActive(id, active)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe(
        (message) => {
          this.alertService.send(message, 'success');
        });
  }

  public delete(id: string): void {
    this.frutaRepository
      .delete(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((message)=>{
          this.alertService.send(message, 'warning');
        }
      )
  }

  public download(): void{
    this.frutaRepository.download({
      search: this.searchInput() || '',
      sort: this.sort().active || 'name',
      order: this.sort().direction || 'asc',
    });
  }
}
