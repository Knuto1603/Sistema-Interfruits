import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import {MatSort, MatSortModule} from '@angular/material/sort';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { AlertService } from '@core/alert/alert.service';
import { FuseMediaWatcherService } from '@coreui2/services/media-watcher';
import { PAGINATION } from '@shared/app.constants';
import { CrudModule } from '@shared/crud.module';
import {finalize, merge, of, switchMap, tap} from 'rxjs';
import { ParametroSharedService } from '@modules/parametro/repository/parametro-shared.service';
import { RoleSharedService } from '@modules/auth/role/repository/role-shared.service';
import { UserService } from '../../repository/user.service';
import {MatTableModule} from "@angular/material/table";
import { MatPaginatorModule } from '@angular/material/paginator';
import {LoadingComponent} from "@shared/component/loading-screen/loading-screen.component";
import {RoleService} from "@modules/auth/role/repository/role.service";


@Component({
	selector: 'app-user-list',
	imports: [
    CommonModule,
    CrudModule,
    RouterOutlet,
    MatDrawer,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    LoadingComponent
  ],
	templateUrl: './user-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserListComponent implements OnInit, AfterViewInit {
	private mediaWatcherService: FuseMediaWatcherService = inject(FuseMediaWatcherService);
	private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
	private router: Router = inject(Router);
	private destroyRef: DestroyRef = inject(DestroyRef);
	private alertService: AlertService = inject(AlertService);
	private userRepository: UserService = inject(UserService);
	private parametroShared: ParametroSharedService = inject(ParametroSharedService);
  private rolesShared: RoleSharedService = inject(RoleSharedService);
  private detectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);
  private rolesRepository: RoleService = inject(RoleService);

  matDrawer = viewChild.required<MatDrawer>('matDrawer');
	paginator = viewChild.required<MatPaginator>(MatPaginator);
	sort = viewChild.required<MatSort>(MatSort);

	public users = this.userRepository.users;
	public isLoading = signal<boolean>(false);
	public searchInput = signal<string>('');
	public pagination = this.userRepository.pagination;
	public parametros = this.parametroShared.parametros;

	public drawerMode = signal<'side' | 'over'>('side');
	public displayedColumns: string[] = ['position', 'fullname', 'username', 'rol', 'isActive', 'actions'];
	public paginationSizes: number[] = PAGINATION.SIZES;


  public ngOnInit(): void {
    this.isLoading.set(true);

    this.userRepository.getAll()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe();

    this.rolesShared.getData().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
		this.parametroShared.getDataLocal().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();

		// Subscribe to media query change
		this.mediaWatcherService
			.onMediaQueryChange$('(min-width: 1440px)')
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe((state) => {
				this.drawerMode.set(state.matches ? 'side' : 'over');
			});
	}

	public ngAfterViewInit(): void {
		merge(this.paginator().page, this.sort().sortChange)
			.pipe(
				takeUntilDestroyed(this.destroyRef),
				switchMap(() => {
					this.isLoading.set(true);

					return this.userRepository.getAll(
						this.paginator().pageIndex,
						this.paginator().pageSize,
						this.searchInput(),
						this.sort().active,
						this.sort().direction
					);
				}),
        tap(() => {
          this.isLoading.set(false);

        })			)
			.subscribe();
	}

  public editUser(id: number): void {
    // Activar la pantalla de carga
    this.isLoading.set(true);
    // Navegar al componente de edición
    this.router.navigate(['./', id], { relativeTo: this.activatedRoute }).then();
  }


  public searchInputChanged(event: string): void {
		this.searchInput.set(event);
		this.isLoading.set(true);
		this.userRepository
			.getAll(0, this.paginator().pageSize, this.searchInput(), this.sort().active, this.sort().direction)
			.pipe(
				takeUntilDestroyed(this.destroyRef),
				finalize(() => this.isLoading.set(false))
			)
			.subscribe();
	}

	public onBackdropClicked(): void {
    this.detectorRef.markForCheck();
		this.router.navigate(['./'], { relativeTo: this.activatedRoute }).then();
	}

	public create(): void {
		this.router.navigate(['./', 'add'], { relativeTo: this.activatedRoute }).then();
	}

	public changeActive(id: string, active: boolean): void {
		this.userRepository.changeActive(id, active).subscribe((message) => {
			this.alertService.send(message, 'success');
		});
	}

	public delete(id: string): void {
		this.isLoading.set(true);
		this.userRepository
			.delete(id)
			.pipe(
				takeUntilDestroyed(this.destroyRef),
				switchMap((message) => {
					this.alertService.send(message, 'warning');
					this.onBackdropClicked();
					// cargar la pagina anterior si el elemento es el ultimo
					const paginationValue = this.pagination();
					if (this.users().length === 0 && paginationValue && paginationValue.page > 0) {
						return this.userRepository.getAll(
							Math.max(0, paginationValue.page - 1),
							this.paginator().pageSize,
							this.searchInput(),
							this.sort().active,
							this.sort().direction
						);
					}

					return of(null);
				}),
				finalize(() => this.isLoading.set(false))
			)
			.subscribe();
	}

	public download(): void {
		this.userRepository.download({
			search: this.searchInput() || '',
			sort: this.sort().active || 'fullname',
			order: this.sort().direction || 'asc',
		});
	}

  public getRolesName(roleIds: string[]): string {
    if (!roleIds || roleIds.length === 0) {
      return '';
    }
    const roles = this.rolesShared.roles();
    let role = "";

    // Filtrar los roles que coinciden con los IDs proporcionados
    for (const roleId of roleIds) {
      const foundRole = roles.find((r) => r.id === roleId);
      if (foundRole) {
        role += foundRole.name + ', ';
      }
    }
    return role ? role.slice(0, -2) : ''; // Eliminar la última coma y espacio
  }
}
