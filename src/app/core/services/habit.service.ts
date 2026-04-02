import {inject, Injectable} from '@angular/core';
import {BehaviorSubject, catchError, finalize, forkJoin, map, of, switchMap, tap, throwError} from 'rxjs';
import {DateService, Habit, NewHabit, NotificationService} from '../index';
import {HabitApiService} from '../index';

// Основной сервис для работы с привычками
// Здесь вся бизнес-логика: стрики, прогресс челленджей, заполнение истории
@Injectable({
  providedIn: 'root'
})
export class HabitService {
  habitsApiService = inject(HabitApiService)
  dataService = inject(DateService)
  notificationService = inject(NotificationService)
  private habitsSubject = new BehaviorSubject<Habit[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();
  habits$ = this.habitsSubject.asObservable();
  challengeHabitsWithProgress$ = this.habits$.pipe(
    map(habits =>
      habits.filter(habit => habit.endDate != null).map(habit => ({
        ...habit,
        progress: this.calculateProgressChallenge(habit)
      })),
    )
  );

  activeChallengeHabits$ = this.challengeHabitsWithProgress$.pipe(
    map(habits => habits.filter(habit => this.isHabitActive(habit)))
  );

  archivedChallengeHabits$ = this.challengeHabitsWithProgress$.pipe(
    map(habits => habits.filter(habit => !this.isHabitActive(habit)))
  );

  today = this.dataService.getToday()


  getHabits() {
    this.loadingSubject.next(true);
    return this.habitsApiService.fetchHabits().pipe(
      switchMap(habits => this.processHabit(habits)),
      tap(updatedHabits => {
        this.habitsSubject.next(updatedHabits);
      }),
      finalize(() => {
        this.loadingSubject.next(false);
      }),
      catchError(err => {
        this.loadingSubject.next(false);
        console.error('Ошибка при загрузке привычек', err);
        this.notificationService.showError('Не удалось загрузить привычки.Проверьте подключение к серверу')
        return throwError(() => err);
      })
    )
  }

  processHabit(habits: Habit[]) {
    let updatedHabits = habits.map(habit => ({
      ...habit,
      history: this.fillHabitHistory(habit),
      streak: this.calculateStreak(habit),
    }))
    let habitsToUpdate = this.findHabitUpdateStreak(habits, updatedHabits);

    if (habitsToUpdate.length > 0) {
      return this.updateHabitsOnServer(habitsToUpdate).pipe(
        map(() => updatedHabits)
      )
    }
    return of(updatedHabits)
  }

  findHabitUpdateStreak(habits: Habit[], updatedHabits: Habit[]) {
    const originalMap = new Map(habits.map(h => [Number(h.id), h]));

    return updatedHabits.filter(habit => {
      const originalHabit = originalMap.get(Number(habit.id));
      return originalHabit && originalHabit.streak !== habit.streak || originalHabit && Object.entries(originalHabit.history).length !==  Object.entries(habit.history).length
    })
  }

  updateHabitsOnServer(updatedHabits: Habit[]) {
    const updateRequestHabit = updatedHabits.map(habit => this.updateHabit(habit.id, habit));
    return forkJoin(updateRequestHabit)
  }

  deleteHabit(id: number) {
    return this.habitsApiService.deleteHabitById(id).pipe(
      tap(() => {
        const updated = this.habitsSubject.value.filter(h => Number(h.id) !== Number(id));
        this.habitsSubject.next(updated);
      }),
      catchError(err => {
        console.error('Ошибка при удалении привычки:', err);
        this.notificationService.showError('Не удалось удалить привычку. Попробуйте позже.')
        return throwError(() => err);
      })
    );
  }

  createHabit(newHabit: NewHabit) {
    let maxId = 0;
    if (this.habitsSubject.value.length > 0) {
      maxId = Math.max(...this.habitsSubject.value.map(h => Number(h.id)));
    }
    const newHabitWithId = {
      ...newHabit,
      id: Number(maxId + 1),
      streak: 0,
      history: {[this.today]: false},
    }
    return this.habitsApiService.addHabit(newHabitWithId).pipe(
      tap(newHabitWithId => {
        this.habitsSubject.next([...this.habitsSubject.value, newHabitWithId]);
      }),
      catchError(err => {
        this.notificationService.showError('Не удалось добавить привычку. Попробуйте позже.');
        console.error('Ошибка при добавлении новой привычки:', err);
        return throwError(() => err);
      })
    );
  }

  moreHabit(id: number) {
    return this.habitsApiService.getHabit(id).pipe(
      catchError(err => {
        return throwError(() => err);
      })
    );
  }

  updateHabit(id: number, habit: Habit) {
    return this.habitsApiService.updateApiHabit(id, habit)
      .pipe(
        tap(savedHabit => {
          const updatedHabit = {
            ...savedHabit,
            streak: this.calculateStreak(savedHabit)
          };
          const updated = this.habitsSubject.value.map(h =>
            Number(h.id) === Number(id) ? updatedHabit : h
          );
          this.habitsSubject.next(updated);
        }),
        catchError(err => {
          console.error('Ошибка обновления привычки:', err);
          this.notificationService.showError('Не удалось обновить привычку. Попробуйте позже.');
          return throwError(() => err);
        })
      );
  }

  // Считаем текущий стрик — идём от сегодня назад, пока привычка выполнялась подряд
  calculateStreak(habit: Habit): number {
    let count = 0;
    const history = this.getSortedHistory(habit.history)
    for (const [date, isDone] of history) {
      if (date > this.today) continue
      if (!isDone && date === this.today) continue
      if (!isDone && date < this.today) break;
      if (isDone) count++;
    }
    return count;
  }

  calculateProgressChallenge(habit: Habit): { totalDays: number; doneDays: number } {
    if (!habit.endDate) {
      return {totalDays: 0, doneDays: 0};
    }
    let createdDate = new Date(habit.createdAt);
    let endDate = new Date(habit.endDate);
    const createdStr = createdDate.toISOString().slice(0, 10);
    const endStr = endDate.toISOString().slice(0, 10);
    const msPerDay = 1000 * 60 * 60 * 24;
    const totalDays = Math.ceil((endDate.getTime() - createdDate.getTime()) / msPerDay);
    let doneDays = 0
    const history = Object.entries(habit.history);
    for (const [date, isDone] of history) {
      if (date >= createdStr && date <= endStr && isDone) {
        doneDays++;
      }
    }
    return {totalDays, doneDays};
  }

  // Заполняем пропущенные дни в истории значением false
  // (нужно, чтобы календарь корректно отображал все дни с момента создания)
  fillHabitHistory(habit: Habit): { [key: string]: boolean } {
    let createdDate =  new Date(habit.createdAt)
    const currentDate =  new Date();
    let updateHistory = {...habit.history}

    for (
      let d =  new Date(createdDate);
      d <= currentDate;
      d.setDate(d.getDate() + 1)
    ) {
      const key = d.toISOString().slice(0, 10);
      if (!(key in updateHistory)) {
        updateHistory[key] = false;
      }
    }

    return updateHistory
  }

  getSortedHistory(history: { [key: string]: boolean }) {
    if (!history) return [];
    return Object.entries(history).sort((a, b) => a[0] < b[0] ? 1 : -1);
  }

  isHabitActive(habit: Habit): boolean {
    const endDate = new Date(habit.endDate!).toISOString().slice(0, 10);
    return endDate > this.today
  }
}
