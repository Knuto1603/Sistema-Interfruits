import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AlertComponent } from '../core/alert/alert.component';

@NgModule({
	imports: [CommonModule, FormsModule, ReactiveFormsModule, AlertComponent],
	exports: [CommonModule, FormsModule, ReactiveFormsModule, AlertComponent],
})
export class SharedModule {}
