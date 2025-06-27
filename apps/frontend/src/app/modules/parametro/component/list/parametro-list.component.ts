import { CommonModule } from '@angular/common';
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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { AlertService } from '@core/alert/alert.service';
import { PAGINATION } from '@shared/app.constants';
import {
	ActiveButtonComponent,
	AddButtonComponent,
	DeleteButtonComponent,
	EditButtonComponent,
	ExportButtonComponent,
	SearchInputComponent,
} from '@shared/component';
import { DeleteConfirmationDirective } from '@shared/directive/delete-confirmation.directive';
import { finalize, merge, switchMap, tap } from 'rxjs';

import { ParametroRepositoryService } from '../../repository/parametro-repository.service';
import {LoadingComponent} from "@shared/component/loading-screen/loading-screen.component";

@Component({
	selector: 'app-parametro-list',
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
	templateUrl: './parametro-list.component.html',
	styles: [],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParametroListComponent implements OnInit, AfterViewInit {
	private parametroRepository: ParametroRepositoryService = inject(ParametroRepositoryService);
	private alertService: AlertService = inject(AlertService);
	private destroyRef: DestroyRef = inject(DestroyRef);

	public parametros = this.parametroRepository.parametros;

	paginator = viewChild.required<MatPaginator>(MatPaginator);
	sort = viewChild.required<MatSort>(MatSort);
	public isLoading = signal<boolean>(false);
	public searchInput = signal<string>('');
	public pagination = this.parametroRepository.pagination;

	public displayedColumns: string[] = ['position', 'parent', 'name', 'alias', 'value', 'isActive', 'actions'];
	public paginationSizes: number[] = PAGINATION.SIZES;

	public ngOnInit(): void {
		this.parametroRepository.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
	}

	public ngAfterViewInit(): void {
		merge(this.paginator().page, this.sort().sortChange)
			.pipe(
				takeUntilDestroyed(this.destroyRef),
				tap(() => this.isLoading.set(true)),
				switchMap(() => {
					return this.parametroRepository.getAll(
						this.paginator().pageIndex,
						this.paginator().pageSize,
						this.searchInput(),
						this.sort().active,
						this.sort().direction
					);
				}),
				finalize(() => this.isLoading.set(false))
			)
			.subscribe();
	}

	public searchInputChanged(event: string): void {
		this.searchInput.set(event);
		this.isLoading.set(true);
		this.parametroRepository
			.getAll(0, this.paginator().pageSize, event, this.sort().active, this.sort().direction)
			.pipe(
				takeUntilDestroyed(this.destroyRef),
				finalize(() => this.isLoading.set(false))
			)
			.subscribe();
	}

	public changeActive(id: string, active: boolean): void {
		this.parametroRepository.changeActive(id, active).subscribe((message) => {
			this.alertService.send(message, 'success');
		});
	}

	public delete(id: string): void {
		this.parametroRepository
			.delete(id)
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe((message) => {
				this.alertService.send(message, 'warning');
			});
	}

	public download(): void {
		this.parametroRepository.download({
			search: this.searchInput() || '',
			sort: this.sort().active || 'name',
			order: this.sort().direction || 'asc',
		});
	}
}
