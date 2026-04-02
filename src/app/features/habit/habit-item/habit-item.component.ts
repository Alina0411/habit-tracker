import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {RouterLink} from '@angular/router';
import {DateService, Habit} from '../../../core';

@Component({
  selector: 'app-habit-item',
  standalone: true,
  imports: [CommonModule, MatIcon, RouterLink],
  templateUrl: './habit-item.component.html',
  styleUrl: './habit-item.component.scss'
})
// Карточка одной привычки — чекбокс выполнения, кнопки удаления и редактирования
export class HabitItemComponent {
  @Input() habit!: Habit;
  @Output() delete = new EventEmitter<number>();
  @Output() edit = new EventEmitter<Habit>();
  @Output() more = new EventEmitter<number>();
  @Output() updateCompletedToday = new EventEmitter<Habit>();
  dateService = inject(DateService);
  today = this.dateService.getToday();

  onToggleCompleted(event: Event): void {
    const target = event.target as HTMLInputElement;
    const updatedHabit = {
      ...this.habit,
      history: {
        ...this.habit.history,
        [this.today]: target.checked
      }
    };
    this.updateCompletedToday.emit(updatedHabit);
  }

  onDelete() {
    this.delete.emit(this.habit.id);
  }

  editHabit() {
    this.edit.emit(this.habit);
  }

}
