import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {DeclensionPipe} from '../../../pipes/declension.pipe';
import {map, Subject, takeUntil} from 'rxjs';
import {HabitService} from '../../../core';
import {AsyncPipe} from '@angular/common';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-habit-top',
  standalone: true,
  imports: [
    DeclensionPipe,
    AsyncPipe,
    MatIcon
  ],
  templateUrl: './habit-top.component.html',
  styleUrl: './habit-top.component.scss'
})
// Топ привычек — показываем только те, у которых стрик больше 1
export class HabitTopComponent implements OnInit, OnDestroy {
  habitService = inject(HabitService);

  private destroy$ = new Subject<void>();

  topHabits$ = this.habitService.habits$.pipe(
    map(habits => habits.filter(h => h.streak > 1)),
  )

  hasNoTopHabits$ = this.topHabits$.pipe(
    map(topHabits => topHabits.length === 0)
  );

  ngOnInit() {
    this.topHabits$.pipe(
      takeUntil(this.destroy$)).subscribe({error: err => console.error('Ошибка обновления привычек:', err)})
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


}
