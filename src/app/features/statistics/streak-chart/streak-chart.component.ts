import {AfterViewInit, Component, ElementRef, inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Chart} from 'chart.js/auto';
import {Subject, takeUntil} from 'rxjs';
import {DateService, Habit, HabitService} from '../../../core';

@Component({
  selector: 'app-streak-chart',
  standalone: true,
  imports: [],
  templateUrl: './streak-chart.component.html',
  styleUrl: './streak-chart.component.scss'
})
// Доnut-чарт с прогрессом за сегодня (Chart.js)
// Каждый сегмент = одна привычка, выполненные подсвечиваются фиолетовым
export class StreakChartComponent implements OnInit, AfterViewInit, OnDestroy {
  habitService = inject(HabitService);
  dateService = inject(DateService);
  habits: Habit[] = [];
  completedCount: number = 0;
  totalCount: number = 0;
  percent: number = 0;
  chart: any;
  today = this.dateService.getToday();
  private destroy$: Subject<void> = new Subject();

  @ViewChild('donutChart') donutChartCanvas!: ElementRef;
  private isViewInitialized = false;

  ngOnInit() {
    this.habitService.habits$
      .pipe(takeUntil(this.destroy$))
      .subscribe(habits => {
      this.habits = habits
      this.totalCount = this.habits.length;
      this.completedCount = this.habits.filter(h => h.history[this.today]).length;
      this.percent = this.habits.length > 0
        ? Math.round((this.completedCount / this.habits.length) * 100)
        : 0;
      this.habits = [...habits].sort((a, b) =>
        a.history[this.today] === b.history[this.today] ? 0 : a.history[this.today] ? -1 : 1
      );

      if (this.isViewInitialized) {
        this.drawChart();
      }
    })
  }

  ngAfterViewInit(): void {
    this.isViewInitialized = true;
  }

  private drawChart() {
    const ctx = this.donutChartCanvas.nativeElement.getContext('2d');
    const isDark = document.documentElement.classList.contains('dark');

    const completedPalette = isDark
      ? ['#8b5cf6', '#7c3aed', '#a78bfa', '#6366f1', '#c4b5fd', '#818cf8']
      : ['#7c3aed', '#6366f1', '#8b5cf6', '#818cf8', '#a78bfa', '#4f46e5'];
    const incompleteColor = isDark
      ? 'rgba(71, 85, 105, 0.35)'
      : 'rgba(203, 213, 225, 0.4)';

    const data = this.habits.map(() => 1);
    const labels = this.habits.map(habit => habit.title);

    let completedIdx = 0;
    const backgroundColors = this.habits.map((habit) => {
      if (habit.history[this.today]) {
        return completedPalette[completedIdx++ % completedPalette.length];
      }
      return incompleteColor;
    });

    const legendColor = isDark ? '#94a3b8' : '#64748b';

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: backgroundColors,
          borderWidth: 0,
          hoverOffset: 6,
        }],
      },
      options: {
        cutout: '74%',
        radius: '88%',
        responsive: true,
        maintainAspectRatio: false,
        animation: { animateRotate: true, duration: 700 },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => {
                const habit = this.habits[context.dataIndex];
                return habit.history[this.today]
                  ? `${habit.title} — выполнено`
                  : `${habit.title} — не выполнено`;
              }
            }
          },
        },
      },
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
