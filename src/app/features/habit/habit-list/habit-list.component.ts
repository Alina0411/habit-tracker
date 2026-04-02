import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {HabitItemComponent} from '../habit-item/habit-item.component';
import {CommonModule} from '@angular/common';
import {MatDialog} from '@angular/material/dialog';
import {HabitDialogComponent} from '../habit-dialog/habit-dialog.component';
import {filter, Subject, switchMap, takeUntil} from 'rxjs';
import {DateService, Habit, HabitService, NotificationService} from '../../../core';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatIcon} from '@angular/material/icon';


@Component({
  selector: 'app-habit-list',
  standalone: true,
  imports: [
    HabitItemComponent,
    CommonModule,
    MatProgressSpinner,
    MatIcon
  ],
  templateUrl: './habit-list.component.html',
  styleUrl: './habit-list.component.scss'
})
// Список привычек на главной — загрузка, удаление, редактирование через диалог
export class HabitListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  habitService = inject(HabitService);
  dialog = inject(MatDialog);
  habits$ = this.habitService.habits$;
  dateService = inject(DateService);
  notificationService = inject(NotificationService);
  loading$ = this.habitService.loading$;


  ngOnInit() {
    this.habitService.getHabits()
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe();
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onDeleteHabit(id: number) {
    this.habitService.deleteHabit(id).subscribe({
      error: () => this.notificationService.showError('Не получилось удалить выбранную привычку')
    });
  }


  onChangeHabit(habit: Habit) {
    const dialogRef = this.dialog.open(HabitDialogComponent, {
      data: {
        isEditMode: true,
        habit: habit,
      },
    })

    dialogRef.afterClosed()
      .pipe(
        filter((res): res is Habit => !!res),
        switchMap(result => {
          return this.habitService.updateHabit(result.id, result)
        })
      ).subscribe({
      error: () => this.notificationService.showError('Не получилось изменить выбранную привычку')
    })
  }

  onUpdateCompletedToday(habit: Habit) {
    this.habitService.updateHabit(habit.id, habit).subscribe({
      error: () => this.notificationService.showError('Не удалось переключить состояние привычки')
    });
  }
}
