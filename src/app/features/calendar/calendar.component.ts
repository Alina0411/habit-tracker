import {
  AfterViewInit,
  Component,
  inject,
  input,
  model,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {MatCard} from '@angular/material/card';
import {MatCalendar} from '@angular/material/datepicker';
import {provideNativeDateAdapter} from '@angular/material/core';
import {CommonModule} from '@angular/common';
import { Subject, takeUntil} from 'rxjs';
import {MatIcon} from '@angular/material/icon';
import {DateService, Habit, HabitService} from '../../core';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    MatCard,
    MatCalendar,
    CommonModule,
    MatIcon,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
})
// Календарь с подсветкой дней по прогрессу (красный→жёлтый→зелёный)
// Долго возилась с динамическими стилями для mat-calendar, в итоге решила через createElement
export class CalendarComponent implements OnInit, OnDestroy, AfterViewInit {
  dateService = inject(DateService)
  today = new Date();
  selected = model<Date | null>(null);
  selectedDate: Date | null = this.today;
  habitService = inject(HabitService);
  habits: Habit[] = [];
  habits$ = this.habitService.habits$
  dates: string[] = [];
  private destroy$ = new Subject<void>();
  progress: { dates: string; totalHabits: number; progress: number; progressByDate: number }[] = [];
  habitsBySelectedDate: { habit: Habit; done: boolean }[] = [];
  viewReady = false;


  @ViewChild(MatCalendar) calendar!: MatCalendar<Date>;
  habitItem = input<Habit | null>(null);
  showStats = input<boolean>(true)

  ngOnInit() {
    this.habits$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.handleHabits(data);
      });


  }

  ngAfterViewInit() {
    this.viewReady = true;
    this.generateProgressStyles();
  }


  private handleHabits(habits: Habit[]) {
    const {dates, progress} = this.buildCalendarData(habits);

    this.dates = dates;
    this.progress = progress;
    this.habits = habits;

    if (this.viewReady && this.calendar) {
      this.calendar.updateTodaysDate();
    }

    if (this.selectedDate) {
      this.onDateSelected(this.selectedDate);
    }
  }

  private buildCalendarData(habits: Habit[]) {
    const dates = habits.flatMap(habit => Object.keys(habit.history));
    const dataSet = [...new Set(dates)].sort();
    const progress = dataSet.map(date => {
      let count = 0;
      let totalHabits = 0;

      habits.forEach(habit => {
        const entry = habit.history[date];
        if (entry !== undefined) {
          totalHabits++;
          if (entry) {
            count++;
          }
        }
      });

      return {
        dates: date,
        totalHabits: totalHabits,
        progress: count,
        progressByDate: totalHabits ? Math.ceil((count / totalHabits) * 100) : 0,
      };
    });

    return {dates, progress};
  }


  onDateSelected(date: Date | null): void {
    if (!date) return;
    this.selectedDate = date;
    const dateStr = this.dateService.getDate(date);

    if (this.habitItem()) {
      const habit = this.habitItem();
      if (habit !== null) {
        this.habitsBySelectedDate = [
          {
            habit: habit,
            done: !!habit.history[dateStr]
          }
        ]
      }
      return;
    }

    this.habitsBySelectedDate = this.habits
      .filter(habit => dateStr in habit.history)
      .map(habit => ({
        habit,
        done: !!habit.history[dateStr]
      }));
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  customDateClass = (date: Date): string => {
    const dateStr = this.dateService.getDate(date);
    const todayStr = this.dateService.getToday();

    if (dateStr > todayStr) return '';

    if (this.habitItem()) {
      const habit = this.habitItem();
      if (habit !== null) {
        if (dateStr in habit.history) {
          return habit.history[dateStr] ? 'progress-100' : 'progress-0';
        }
      }

      return ''
    }
    const progressObj = this.progress.find(p => p.dates === dateStr);
    if (!progressObj) return '';


    const progress = Math.round(progressObj.progressByDate);
    return `progress-${progress}`;
  };


  generateProgressStyles() {
    for (let i = 0; i <= 100; i++) {
      const className = `progress-${i}`;
      if (!document.querySelector(`style[data-progress="${className}"]`)) {
        const color = this.getProgressColor(i);
        const style = document.createElement('style');
        style.setAttribute('data-progress', className);
        style.innerHTML = `
        .mat-calendar-body-cell.${className} .mat-calendar-body-cell-content {
          background-color: ${color};
          color: black;
          border-radius: 50%;
        }
      `;
        document.head.appendChild(style);
      }
    }
  }


  // Интерполяция цвета: 0% — красный, 50% — жёлтый, 100% — зелёный
  getProgressColor(progress: number): string {
    const alpha = 0.5;

    const red = {r: 255, g: 100, b: 100};
    const yellow = {r: 255, g: 255, b: 153};
    const green = {r: 152, g: 251, b: 152};

    const interpolateColor = (start: any, end: any, t: number) => {
      const r = Math.round(start.r + (end.r - start.r) * t);
      const g = Math.round(start.g + (end.g - start.g) * t);
      const b = Math.round(start.b + (end.b - start.b) * t);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    if (progress <= 50) {
      return interpolateColor(red, yellow, progress / 50);
    } else {
      return interpolateColor(yellow, green, (progress - 50) / 50);
    }
  }
}
