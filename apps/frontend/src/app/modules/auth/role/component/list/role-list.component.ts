import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  OnInit, signal,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import {MatSort, MatSortModule} from '@angular/material/sort';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { PAGINATION } from '@shared/app.constants';
import {finalize, merge, Observable, switchMap, tap } from 'rxjs';

import { FuseMediaWatcherService } from '@coreui2/services/media-watcher';
import { AlertService } from '@core/alert/alert.service';
import { CrudModule } from '@shared/crud.module';
import { Pagination } from '@shared/interface/pagination.interface';
import { Role } from '../../interface/role.interface';
import { RoleService } from '../../repository/role.service';
import {MatTableModule} from "@angular/material/table";
import {LoadingComponent} from "@shared/component/loading-screen/loading-screen.component";

@Component({
  selector: 'app-role-list',
  imports: [
    CommonModule,
    CrudModule,
    RouterOutlet,
    RouterLink,
    MatDrawer,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    LoadingComponent
  ],
  templateUrl: './role-list.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleListComponent implements OnInit, AfterViewInit {
  private mediaWatcherService: FuseMediaWatcherService = inject(FuseMediaWatcherService);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private router: Router = inject(Router);
  private detectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);
  private destroyRef: DestroyRef = inject(DestroyRef);
  private alertService: AlertService = inject(AlertService);
  private roleRepository: RoleService = inject(RoleService);


  @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
  public drawerMode = signal<'side' | 'over'>('side');
  @ViewChild(MatPaginator) private paginator: MatPaginator;
  @ViewChild(MatSort) private sort: MatSort;

  public roles$: Observable<Role[]> = this.roleRepository.roles$.pipe(
    tap((): void => {
      this.detectorRef.markForCheck();
    })
  );

  public searchInput: string = '';
  public pagination: Pagination;
  public displayedColumns: string[] = ['position', 'name', 'alias', 'isActive', 'actions'];
  public paginationSizes: number[] = PAGINATION.SIZES;

  public isLoading = signal<boolean>(false);

  public ngOnInit(): void {
    this.isLoading.set(true);

    this.roleRepository.getAll()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false))
      ).subscribe();

    this.roleRepository.pagination$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((pagination) => {
      this.pagination = pagination;
      this.detectorRef.markForCheck();
    });

    // Subscribe to media query change
    this.mediaWatcherService
      .onMediaQueryChange$('(min-width: 1440px)')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((state) => {
        // Calculate the drawer mode
        this.drawerMode.set(state.matches ? 'side' : 'over');
        this.detectorRef.markForCheck();
      });
  }

  public ngAfterViewInit(): void {
    if (!this.paginator) {
      return;
    }

    this.detectorRef.markForCheck();

    merge(this.paginator.page, this.sort.sortChange)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(() => {
          this.isLoading.set(true);

          return this.roleRepository.getAll(
            this.paginator.pageIndex,
            this.paginator.pageSize,
            this.searchInput,
            this.sort.active,
            this.sort.direction
          );
        }),
        tap(() => {
          this.isLoading.set(false);

        })
      )
      .subscribe();
  }

  public editRole(id: number): void {
    // Activar la pantalla de carga
    this.isLoading.set(true);
    // Navegar al componente de edición
    this.router.navigate(['./', id], { relativeTo: this.activatedRoute }).then();
  }

  public searchInputChanged(event: string): void {
    this.searchInput = event;
    this.isLoading.set(true);

    this.roleRepository
      .getAll(0, this.paginator.pageSize, this.searchInput, this.sort.active, this.sort.direction)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.isLoading.set(false);

      });
  }

  public onBackdropClicked(): void {
    this.detectorRef.markForCheck();
    this.router.navigate(['./'], { relativeTo: this.activatedRoute }).then();
  }

  public create(): void {
    this.detectorRef.markForCheck();
    this.router.navigate(['./', 'add'], { relativeTo: this.activatedRoute }).then();
  }

  public changeActive(id: number, active: boolean): void {
    const action: Observable<string> = active ? this.roleRepository.disable(id) : this.roleRepository.enable(id);

    action.subscribe((message) => {
      this.alertService.send(message, 'success');
      this.detectorRef.markForCheck();
    });
  }

  public delete(id: number): void {
    this.roleRepository
      .delete(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((message) => {
        this.alertService.send(message, 'warning');
        this.onBackdropClicked();
      });
  }

  public download(): void {
    this.roleRepository.download({
      search: this.searchInput || '',
      sort: this.sort.active || 'nombre',
      order: this.sort.direction || 'asc',
    });
  }
}
