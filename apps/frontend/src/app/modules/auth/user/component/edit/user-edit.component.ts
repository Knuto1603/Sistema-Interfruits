import {
	AfterViewInit,
	ChangeDetectionStrategy,
	Component,
	DestroyRef,
	effect,
	ElementRef,
	inject,
	input,
	OnInit,
	signal,
	viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { AlertService } from '@core/alert/alert.service';
import { CloseButtonComponent } from '@shared/component/buttons/close/close-button.component';
import { MenuButtonComponent } from '@shared/component/buttons/menu/menu-button.component';
import { CrudModule } from '@shared/crud.module';
import { filter } from 'rxjs';

import { User } from '../../interface/user.interface';
import { UserService } from '../../repository/user.service';
import { UserListComponent } from '../list/user-list.component';
import {AsyncPipe} from "@angular/common";
import {RoleService} from "@modules/auth/role/repository/role.service";

@Component({
	selector: 'app-user-edit',
  imports: [
    CrudModule,
    RouterLink,
    MenuButtonComponent,
    CloseButtonComponent,
    AsyncPipe,

  ],
	templateUrl: './user-edit.component.html',
	styles: ``,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserEditComponent implements OnInit, AfterViewInit {
	private userComponent: UserListComponent = inject(UserListComponent);
	private userService: UserService = inject(UserService);
	private formBuilder: UntypedFormBuilder = inject(UntypedFormBuilder);
	private router: Router = inject(Router);
	private alertService: AlertService = inject(AlertService);
	private destroyRef: DestroyRef = inject(DestroyRef);
	private route: ActivatedRoute = inject(ActivatedRoute);
  private roleService: RoleService = inject(RoleService);



  readonly userNombreField = viewChild.required<ElementRef>('usernameField');

	// Obtener el ID de los parámetros de la ruta en lugar de usar una señal de entrada
	public userId = signal<string>('');

	// Obtener datos del usuario del resolver
	public userData = signal<User | null>(null);

	// Indicador de carga
	public saving = signal<boolean>(false);

  public roles$ = this.roleService.rolesShared$;


  // Inicializar formulario con valores predeterminados
	public userForm: UntypedFormGroup = this.formBuilder.group({
		id: [null],
		username: [null, [Validators.required, Validators.minLength(4)]],
		password: [null, [Validators.minLength(6)]],
		fullname: [null, [Validators.required, Validators.minLength(4)]],
		roles: [[], [Validators.required]],
		isActive: [true],
	});

	public roles: string[] = ['ROLE_USER', 'ROLE_ADMIN'];

	constructor() {
		// Obtener datos del resolver y actualizar el formulario cuando estén disponibles
		effect(() => {
			if (this.userData()) {
				const user = this.userData();
				this.userForm.patchValue({
					id: user?.id,
					username: user?.username,
					fullname: user?.fullname,
					roles: user?.roles,
					isActive: user?.isActive,
				});
				console.log('Datos del usuario cargados en el formulario:', user);
			}
		});
	}

	ngOnInit(): void {
		this.userComponent.matDrawer().open().then();
    this.roleService.getAllShared().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();


    // Obtener datos del resolver directamente
		const routeData = this.route.snapshot.data;
		if (routeData['user']) {
			this.userData.set(routeData['user']);
		}

		// Obtener ID de la ruta
		const id = this.route.snapshot.paramMap.get('id');
		if (id) {
			this.userId.set(id);
		}

    // Escuchar los datos del resolver y desactivar la carga cuando estén listos
    this.route.data.subscribe((data) => {
      // Desactivar la pantalla de carga
      this.userComponent.isLoading.set(false);

    });

		// Listen for NavigationEnd event to focus on the title field
		this.router.events
			.pipe(
				takeUntilDestroyed(this.destroyRef),
				filter((event) => event instanceof NavigationEnd)
			)
			.subscribe(() => {
				setTimeout(() => {
					try {
						if (this.userNombreField() && this.userNombreField().nativeElement) {
							this.userNombreField().nativeElement.focus();
						}
					} catch (error) {
						console.error('Error al enfocar el campo:', error);
					}
				}, 100);
			});
	}

	ngAfterViewInit(): void {
		// Listen for matDrawer opened change
		this.userComponent
			.matDrawer()
			.openedChange.pipe(
				takeUntilDestroyed(this.destroyRef),
				filter((opened) => opened)
			)
			.subscribe((): void => {
				setTimeout(() => {
					try {
						if (this.userNombreField() && this.userNombreField().nativeElement) {
							this.userNombreField().nativeElement.focus();
						}
					} catch (error) {
						console.error('Error al enfocar el campo después de abrir drawer:', error);
					}
				}, 100);
			});
	}

	public closeDrawer(): Promise<MatDrawerToggleResult> {
		return this.userComponent.matDrawer().close();
	}

	public get _form() {
		return this.userForm.controls;
	}

	public save(): void {
		if (this.userForm.invalid) {
			return;
		}

		this.saving.set(true);
		const user: User = this.userForm.getRawValue();

		this.userService.update(this.userId(), user).subscribe({
			next: (message) => {
				this.saving.set(false);
				this.alertService.send(message);
				this.userComponent.onBackdropClicked();
			},
			error: (error) => {
				this.saving.set(false);
				console.error('Error al actualizar usuario:', error);
				this.alertService.send('Error al actualizar el usuario', 'error');
			}
		});
	}

	public delete() {
		try {
			this.userComponent.delete(this.userId());
		} catch (error) {
			console.error('Error al eliminar:', error);
			this.alertService.send('Error al eliminar el usuario', 'error');
		}
	}

	get isActiveControl() {
		return this.userForm.get('isActive');
	}
}
