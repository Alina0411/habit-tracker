import {AfterViewInit, Component, ElementRef, inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Chart} from 'chart.js/auto';
import {Subject, takeUntil} from 'rxjs';
import {Habit, HabitService} from '../../../core';

@Component({
  selector: 'app-progress-chart',
  imports: [],
  templateUrl: './progress-chart.component.html',
  styleUrl: './progress-chart.component.scss'
})
// Горизонтальный bar chart — сколько дней каждая привычка была выполнена
export class ProgressChartComponent implements OnInit, AfterViewInit, OnDestroy {
  habitService = inject(HabitService)
  habits: Habit[] = []
  chart: any;
  @ViewChild('habitProgressChart') chartCanvas!: ElementRef<HTMLCanvasElement>;
  private isViewInitialized = false;
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.habitService.habits$
      .pipe(takeUntil(this.destroy$))
      .subscribe(habits => {
      this.habits = habits;

      if (this.isViewInitialized) {
        this.createChart();
      }
    })
  }

  ngAfterViewInit(): void {
    this.isViewInitialized = true;
    if (this.habits.length > 0) {
      this.createChart();
    }
  }

  getProgress(habit: Habit) {
    const createdDate = new Date(habit.createdAt);
    const completedDays = Object.values(habit.history).filter(Boolean).length;
    return Math.round(completedDays);
  }

  createChart() {
    const labels = this.habits.map(habit => habit.title);
    const progressData = this.habits.map(h => this.getProgress(h));
    const isDark = document.documentElement.classList.contains('dark');

    const canvas = this.chartCanvas.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;

    const gradient = ctx.createLinearGradient(0, 0, canvas.offsetWidth || 400, 0);
    gradient.addColorStop(0, 'rgba(124, 58, 237, 0.85)');
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0.85)');

    const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
    const textColor = isDark ? '#94a3b8' : '#64748b';
    const titleColor = isDark ? '#e2e8f0' : '#1e293b';

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Прогресс',
          data: progressData,
          backgroundColor: gradient,
          borderWidth: 0,
          borderRadius: 6,
          borderSkipped: false,
        }],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: 'Общая статистика по привычкам',
            color: titleColor,
            font: { size: 13, weight: 'bold', family: 'Inter, sans-serif' },
            padding: { bottom: 16 },
          },
          tooltip: {
            callbacks: {
              label: (ctx: any) => `${ctx.label}: ${ctx.raw} дней`
            }
          }
        },
        scales: {
          x: {
            min: 0,
            grid: { color: gridColor },
            border: { display: false },
            ticks: {
              color: textColor,
              font: { size: 11, family: 'Inter, sans-serif' },
              callback(tickValue: string | number) { return `${tickValue}д`; }
            },
          },
          y: {
            grid: { display: false },
            border: { display: false },
            ticks: {
              color: textColor,
              font: { size: 12, family: 'Inter, sans-serif' },
            },
          }
        }
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
