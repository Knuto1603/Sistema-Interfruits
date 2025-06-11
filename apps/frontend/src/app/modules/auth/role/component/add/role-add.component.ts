import {
	AfterViewInit,
	ChangeDetectionStrategy,
	Component,
	DestroyRef,
	ElementRef,
	inject,
	OnInit,
	ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';

import { AlertService } from '@core/alert/alert.service';
import { CrudModule } from '@shared/crud.module';
import { Role } from '../../interface/role.interface';
import { RoleService } from '../../repository/role.service';
import { RoleListComponent } from '../list/role-list.component';

@Component({
	selector: 'app-role-add',
	imports: [CrudModule, RouterLink],
	templateUrl: './role-add.component.html',
	styles: ``,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleAddComponent implements OnInit, AfterViewInit {
	private roleComponent: RoleListComponent = inject(RoleListComponent);
	private roleService: RoleService = inject(RoleService);
	private formBuilder: UntypedFormBuilder = inject(UntypedFormBuilder);
	private router: Router = inject(Router);
	private alertService: AlertService = inject(AlertService);
	private destroyRef: DestroyRef = inject(DestroyRef);

	@ViewChild('nombreField') private roleNombreField: ElementRef;
	public roleForm: UntypedFormGroup;

	ngOnInit(): void {
		this.roleComponent.matDrawer.open().then();

		this.roleForm = this.formBuilder.group({
			id: [null],
      name: [null, [Validators.required]],
			alias: [null, [Validators.required]],
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

		this.roleService.create(role).subscribe((message) => {
			this.alertService.send(message);
			this.roleComponent.onBackdropClicked();
		});
	}



  get isActiveControl() {
    return this.roleForm.get('isActive');
  }
}
