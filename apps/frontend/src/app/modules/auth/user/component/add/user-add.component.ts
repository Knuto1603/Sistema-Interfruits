import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  OnInit, signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { AlertService } from '@core/alert/alert.service';
import { CloseButtonComponent } from '@shared/component/buttons/close/close-button.component';
import { CrudModule } from '@shared/crud.module';
import { filter } from 'rxjs';

import { ParametroSharedPipe } from '@modules/parametro/pipe/parametro-shared.pipe';
import { User } from '../../interface/user.interface';
import { UserService } from '../../repository/user.service';
import { UserListComponent } from '../list/user-list.component';
import {SpinnerComponent} from "@coreui/angular";
import {RoleService} from '../../../role/repository/role.service'
import {AsyncPipe} from "@angular/common";

@Component({
	selector: 'app-user-add',
  imports: [CrudModule, RouterLink, CloseButtonComponent, ParametroSharedPipe, SpinnerComponent, AsyncPipe],
	templateUrl: './user-add.component.html',
	styles: ``,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserAddComponent implements OnInit, AfterViewInit {
  private roleService: RoleService = inject(RoleService);
	private userComponent: UserListComponent = inject(UserListComponent);
	private userService: UserService = inject(UserService);
	private formBuilder: UntypedFormBuilder = inject(UntypedFormBuilder);
	private router: Router = inject(Router);
	private alertService: AlertService = inject(AlertService);
	private destroyRef: DestroyRef = inject(DestroyRef);

	readonly userNombreField = viewChild.required<ElementRef>('usernameField');
	public userForm: UntypedFormGroup;
	public parametros = this.userComponent.parametros;
  public saving = signal(false);

	//public roles: string[] = ['ROLE_USER', 'ROLE_ADMIN'];
  public roles$ = this.roleService.rolesShared$;

	ngOnInit(): void {
		this.userComponent.matDrawer().open().then();

    this.roleService.getAllShared().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();


    this.userForm = this.formBuilder.group({
			id: [null],
			username: [null, [Validators.required, Validators.minLength(4)]],
			password: [null, [Validators.required, Validators.minLength(6)]],
			fullname: [null, [Validators.required, Validators.minLength(4)]],
			roles: [[], [Validators.required]],
			gender: [null],
			isActive: [true],
		});

		// Listen for NavigationEnd event to focus on the title field
		this.router.events
			.pipe(
				takeUntilDestroyed(this.destroyRef),
				filter((event) => event instanceof NavigationEnd)
			)
			.subscribe(() => {
				// Focus on the title field
				this.userNombreField().nativeElement.focus();
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
				this.userNombreField().nativeElement.focus();
			});
	}

	public closeDrawer(): Promise<MatDrawerToggleResult> {
		return this.userComponent.matDrawer().close();
	}

	public get _form() {
		return this.userForm.controls;
	}

	public save(): void {
    this.saving.set(true);
		const user: User = this.userForm.getRawValue();

		this.userService.create(user).subscribe((message) => {
      this.saving.set(false);
			this.alertService.send(message);
			this.userComponent.onBackdropClicked();
		});
	}


  get isActiveControl() {
    return this.userForm.get('isActive');
  }
}
