import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  OnInit, signal,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';

import { AlertService } from '@core/alert/alert.service';
import { CrudModule } from '@shared/crud.module';
import { Role } from '../../interface/role.interface';
import { RoleService } from '../../repository/role.service';
import { RoleListComponent } from '../list/role-list.component';
import {CloseButtonComponent} from "@shared/component/buttons/close/close-button.component";
import {MenuButtonComponent} from "@shared/component/buttons/menu/menu-button.component";

@Component({
	selector: 'app-role-edit',
  imports: [
    CrudModule,
    RouterLink,
    CloseButtonComponent,
    MenuButtonComponent,

  ],
	templateUrl: './role-edit.component.html',
	styles: ``,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleEditComponent implements OnInit, AfterViewInit {
	private roleComponent: RoleListComponent = inject(RoleListComponent);
	private roleService: RoleService = inject(RoleService);
	private formBuilder: UntypedFormBuilder = inject(UntypedFormBuilder);
	private router: Router = inject(Router);
	private alertService: AlertService = inject(AlertService);
	private destroyRef: DestroyRef = inject(DestroyRef);
	private detectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);
	private activatedRoute: ActivatedRoute = inject(ActivatedRoute);

	@ViewChild('nombreField') private roleNombreField: ElementRef;
	public role?: Role;
	public roleForm: UntypedFormGroup;
  public saving = signal<boolean>(false);

	ngOnInit(): void {
		this.roleComponent.matDrawer.open().then();

		this.roleForm = this.formBuilder.group({
			id: [null],
			name: [null, [Validators.required]],
			alias: [null, [Validators.required]],
			isActive: [null],
		});

    // Escuchar los datos del resolver y desactivar la carga cuando estén listos
    this.activatedRoute.data.subscribe((data) => {
      // Desactivar la pantalla de carga
      this.roleComponent.isLoading.set(false);

      // Establecer los datos del formulario
      this.roleForm.patchValue(data['role']);
      this.role = data['role'];
      this.detectorRef.markForCheck();
    });


    // Listen for NavigationEnd event to focus on the title field
		this.router.events
			.pipe(
				takeUntilDestroyed(this.destroyRef),
				filter((event) => event instanceof NavigationEnd)
			)
			.subscribe(() => {
				// Focus on the title field
				this.roleNombreField.nativeElement.focus();
			});
	}

	ngAfterViewInit(): void {
		// Listen for matDrawer opened change
		this.roleComponent.matDrawer.openedChange
			.pipe(
				takeUntilDestroyed(this.destroyRef),
				filter((opened) => opened)
			)
			.subscribe((): void => {
				this.roleNombreField.nativeElement.focus();
			});
	}

	public closeDrawer(): Promise<MatDrawerToggleResult> {
		return this.roleComponent.matDrawer.close();
	}

	public get _form() {
		return this.roleForm.controls;
	}

	public save(): void {
		const role: Role = this.roleForm.getRawValue();
    this.saving.set(true);

		if (this.role?.id) {
			this.roleService.update(this.role.id, role).subscribe((message) => {
        this.saving.set(false);
				this.alertService.send(message);
				this.roleComponent.onBackdropClicked();
			});
		}
	}

	public delete() {
		if (this.role?.id) {
			this.roleComponent.delete(this.role.id);
		}
	}


  get isActiveControl() {
    return this.roleForm.get('isActive');
  }
}
