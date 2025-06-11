import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DEFAULT_OPTIONS, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';

import {
	ActiveButtonComponent,
	AddButtonComponent,
	DeleteButtonComponent,
	EditButtonComponent,
	ExportButtonComponent,
	SaveButtonComponent,
	SearchInputComponent,
	UpdateButtonComponent,
} from './component';
import { AddMenuButtonComponent } from './component/buttons/add/add-menu-button.component';
import { DeleteMenuButtonComponent } from './component/buttons/delete/delete-menu-button.component';
import { ExportMenuButtonComponent } from './component/buttons/export/export-menu-button.component';
import { ImportButtonComponent } from './component/buttons/import/import-button.component';
import { ImportMenuButtonComponent } from './component/buttons/import/import-menu-button.component';
import { DeleteConfirmationDirective } from './directive/delete-confirmation.directive';

@NgModule({
	declarations: [],
	imports: [
		MatPaginatorModule,
		MatIconModule,
		MatSortModule,
		MatFormFieldModule,
		MatInputModule,
		MatButtonModule,
		MatSlideToggleModule,
		MatCheckboxModule,
		MatTableModule,
		ReactiveFormsModule,
		MatSidenavModule,
		MatDividerModule,
		MatMenuModule,
		MatDialogModule,
		MatSelectModule,
		ActiveButtonComponent,
		AddButtonComponent,
		DeleteButtonComponent,
		DeleteConfirmationDirective,
		SearchInputComponent,
		ExportButtonComponent,
		ImportButtonComponent,
		ImportMenuButtonComponent,
		EditButtonComponent,
		DeleteMenuButtonComponent,
		ExportMenuButtonComponent,
		AddMenuButtonComponent,
		UpdateButtonComponent,
		SaveButtonComponent,
		MatRadioModule,
	],
	exports: [
		MatPaginatorModule,
		MatIconModule,
		MatSortModule,
		MatFormFieldModule,
		MatInputModule,
		MatButtonModule,
		MatSlideToggleModule,
		MatCheckboxModule,
		MatTableModule,
		ReactiveFormsModule,
		MatSidenavModule,
		MatDividerModule,
		MatMenuModule,
		MatDialogModule,
		MatSelectModule,
		ActiveButtonComponent,
		AddButtonComponent,
		DeleteButtonComponent,
		DeleteConfirmationDirective,
		SearchInputComponent,
		ExportButtonComponent,
		ImportButtonComponent,
		ImportMenuButtonComponent,
		EditButtonComponent,
		DeleteMenuButtonComponent,
		ExportMenuButtonComponent,
		AddMenuButtonComponent,
		UpdateButtonComponent,
		SaveButtonComponent,
		MatRadioModule,
	],
	providers: [{ provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { disableClose: true } }],
})
export class CrudModule {}
