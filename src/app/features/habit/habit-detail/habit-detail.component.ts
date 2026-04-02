import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {CommonModule} from '@angular/common';
import {Subject, switchMap, takeUntil} from 'rxjs';
import {MatIcon} from '@angular/material/icon';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {DateService, Habit, HabitService} from '../../../core';
import {CalendarComponent} from '../../calendar/calendar.component';


@Component({
  selector: 'app-habit-detail',
  standalone: true,
  imports: [CommonModule, MatIcon, MatProgressSpinner, CalendarComponent],
  templateUrl: './habit-detail.component.html',
  styleUrl: './habit-detail.component.scss',
  providers: [],
})
// Страница детальной информации по привычке с календарём и историей
export class HabitDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  habitService = inject(HabitService);
  habit: Habit | undefined;
  dateService = inject(DateService)
  today = this.dateService.getToday();
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.route.params
      .pipe(
        takeUntil(this.destroy$),
        switchMap(params => {
          const id = params['id'];
          return this.habitService.moreHabit(id);
        })
      )
      .subscribe(habit => {
        this.habit = habit;
      });
  }

  getHistory(habit: Habit) {
    return this.habitService.getSortedHistory(habit.history).map(([date, done]) => ({date, done}))
  }

  getCompletedCount(habit: Habit): number {
    const history = this.getHistory(habit);
    return history.filter(entry => entry.done).length;
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
