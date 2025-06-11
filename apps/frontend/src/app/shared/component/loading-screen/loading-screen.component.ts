import { Component, Input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './loading-screen.component.html',
})
export class LoadingComponent {
  @Input() diameter: number = 50;
  @Input() message: string = 'Cargando datos...';
}
