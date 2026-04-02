import { Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogContent,
  MatDialogModule,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';

import {MatIcon} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {CommonModule} from '@angular/common';
import {DateService, Habit, NewHabit} from '../../../core';

@Component({
  selector: 'app-habit-dialog',
  standalone: true,
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatIcon,
    MatFormFieldModule,
    MatInputModule,
    CommonModule
  ],
  templateUrl: './habit-dialog.component.html',
  styleUrl: './habit-dialog.component.scss',
})
// Диалог добавления/редактирования привычки с валидацией даты
export class HabitDialogComponent  {
  dialogRef = inject(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);
  dataService = inject(DateService)
  title = 'Добавить привычку';
  isEditMode = false;
  habit!: Habit

  minDateStr = this.dataService.getToday()

  minDateValidator = (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate < today ? { minDate: true } : null;
  }

  form!: FormGroup

  constructor() {
    this.form = new FormGroup({
      title: new FormControl<string>('', Validators.required),
      dateEnd: new FormControl<string | null>(null, [this.minDateValidator])
    });

    if (this.data) {
      this.isEditMode = this.data.isEditMode;
      this.habit = {...this.data.habit};
    } else {
      this.isEditMode = false;
      this.habit = {} as Habit;
    }

    if (this.isEditMode) {
      this.title = 'Измените вашу привычку'
      this.form.patchValue({
        title: this.habit.title,
      })
    }
  }

  saveHabit() {
    this.form.markAllAsTouched();
    this.form.updateValueAndValidity();
    if (this.form.invalid) return
    if (this.isEditMode) {
      const updatedHabit = {
        ...this.habit,
        title: this.form.value.title,
        endDate: this.form.value.dateEnd ? this.form.value.dateEnd! : this.habit.endDate,
      }
      this.dialogRef.close(updatedHabit);
    } else {
      const newHabit: NewHabit = {
        title: this.form.value.title!,
        createdAt: this.minDateStr,
        endDate: this.form.value.dateEnd ? this.form.value.dateEnd! : null,
      };
      this.dialogRef.close(newHabit);
    }
  }
}
