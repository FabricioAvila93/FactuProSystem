import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-snackbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './snackbar.component.html',
  styleUrls: ['./snackbar.component.css'],
})
export class SnackbarComponent {
  @Input() message: string = '';
  @Input() type: 'success' | 'error' = 'success';
  @Input() visible: boolean = false;

  // Ocultar automáticamente después de unos segundos
  ngOnChanges() {
    if (this.visible) {
      setTimeout(() => {
        this.visible = false;
      }, 3000);
    }
  }
}
