import {Habit} from './habit.models';

export interface HabitDialogDataModel {
  isEditMode: boolean;
  habit: Habit
}
