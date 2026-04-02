import {inject, Injectable} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})

export class NotificationService {
  private snackBar = inject(MatSnackBar);

  showError(message: string, duration: number = 3000) {
    this.snackBar.open(message, 'Закрыть', {
      duration: duration,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['error-snackbar'],
    })
  }

  showSuccess(message: string, duration: number = 3000) {
    this.snackBar.open(message, 'Закрыть', {
      duration: duration,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['success-snackbar'],
    })
  }

}
