import {Injectable} from '@angular/core';
import {Observable, of, throwError} from 'rxjs';
import {Habit, NewHabit} from '../index';

const STORAGE_KEY = 'habits';

// Форматирование даты без UTC-сдвига (как в DateService)
function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

// Генерация истории от startDate до endDate с паттерном выполнения
function generateHistory(startDate: Date, endDate: Date, pattern: boolean[]): { [key: string]: boolean } {
  const history: { [key: string]: boolean } = {};
  const d = new Date(startDate);
  d.setHours(12, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(12, 0, 0, 0);
  let i = 0;
  while (d <= end) {
    history[formatDate(d)] = pattern[i % pattern.length];
    d.setDate(d.getDate() + 1);
    i++;
  }
  return history;
}

// Демо-привычки для показа всех возможностей приложения
function createDefaultHabits(): Habit[] {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const todayStr = formatDate(today);

  // 1) Зарядка — обычная привычка, стрик ~10 дней подряд → попадёт в топ
  //    Последние дни все true, сегодня false (ещё не сделала)
  const gym = generateHistory(daysAgo(35), daysAgo(1), [
    true, false, true, true, false, true, true, true, false, true,
    true, true, true, true, true, true, true, true, true, true,
    true, true, true, true, true,
  ]);
  gym[todayStr] = false;

  // 2) Чтение — активный челлендж (до +20 дней), история 18 дней
  const reading = generateHistory(daysAgo(18), daysAgo(1), [
    true, true, false, true, true, true, true, false, true, true,
    true, false, true, true, true, true, true, true,
  ]);
  reading[todayStr] = false;

  // 3) Вода — обычная привычка, стабильный стрик ~7 дней → в топ
  const water = generateHistory(daysAgo(28), daysAgo(1), [
    true, true, false, true, false, true, true, false, true, true,
    true, false, true, true, true, true, true, true, true, true,
    true, true, true, true, true, true, true, true,
  ]);
  water[todayStr] = false;

  // 4) Медитация — завершённый челлендж (endDate 7 дней назад) → архив
  const meditation = generateHistory(daysAgo(45), daysAgo(7), [
    true, true, true, true, false, true, true, true, true, true,
    false, true, true, true, true, true, true, false, true, true,
  ]);

  // 5) Английский — обычная, рваная история, без стрика — для контраста
  const english = generateHistory(daysAgo(22), daysAgo(1), [
    true, false, true, true, false, false, true, false, true, false,
    true, true, false, false, true, false, true, false, false, true,
    false, true,
  ]);
  english[todayStr] = false;

  return [
    {
      id: 1,
      title: 'Делать зарядку 10 минут',
      createdAt: formatDate(daysAgo(35)),
      endDate: null,
      streak: 0,
      history: gym,
    },
    {
      id: 2,
      title: 'Читать 30 страниц',
      createdAt: formatDate(daysAgo(18)),
      endDate: formatDate(daysAgo(-20)),
      streak: 0,
      history: reading,
    },
    {
      id: 3,
      title: 'Пить 2 литра воды',
      createdAt: formatDate(daysAgo(28)),
      endDate: null,
      streak: 0,
      history: water,
    },
    {
      id: 4,
      title: 'Медитация 15 минут',
      createdAt: formatDate(daysAgo(45)),
      endDate: formatDate(daysAgo(7)),
      streak: 0,
      history: meditation,
    },
    {
      id: 5,
      title: 'Учить английский 20 минут',
      createdAt: formatDate(daysAgo(22)),
      endDate: null,
      streak: 0,
      history: english,
    },
  ];
}

// Работа с localStorage — не нужен бэкенд
@Injectable({
  providedIn: 'root'
})
export class HabitApiService {

  constructor() {
    if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(createDefaultHabits()));
    }
  }

  private getAll(): Habit[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  private saveAll(habits: Habit[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
  }

  fetchHabits(): Observable<Habit[]> {
    return of(this.getAll());
  }

  deleteHabitById(id: number): Observable<void> {
    const habits = this.getAll().filter(h => Number(h.id) !== Number(id));
    this.saveAll(habits);
    return of(undefined);
  }

  addHabit(newHabit: NewHabit): Observable<Habit> {
    const habits = this.getAll();
    const habit = { ...newHabit } as Habit;
    habits.push(habit);
    this.saveAll(habits);
    return of(habit);
  }

  getHabit(id: number): Observable<Habit> {
    const habit = this.getAll().find(h => Number(h.id) === Number(id));
    if (!habit) {
      return throwError(() => new Error('Привычка не найдена'));
    }
    return of(habit);
  }

  updateApiHabit(id: number, habit: Habit): Observable<Habit> {
    const habits = this.getAll();
    const index = habits.findIndex(h => Number(h.id) === Number(id));
    if (index === -1) {
      return throwError(() => new Error('Привычка не найдена'));
    }
    habits[index] = { ...habit, id: Number(id) };
    this.saveAll(habits);
    return of(habits[index]);
  }
}
