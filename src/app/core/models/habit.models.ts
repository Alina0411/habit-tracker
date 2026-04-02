export interface Habit {
  id: number;
  title: string;
  createdAt: string;
  endDate?: string | null;
  streak: number;
  history: {
    [date: string]: boolean;
  };
  progress?: {
    totalDays: number; doneDays: number;
  }
}

export type NewHabit = Omit<Habit, 'id' | 'history' | 'streak'>;
