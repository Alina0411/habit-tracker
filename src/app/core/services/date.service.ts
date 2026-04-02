import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
// Вспомогательный сервис для форматирования дат в ISO (YYYY-MM-DD)
export class DateService{
  getToday():string {
    return new Date().toISOString().slice(0, 10);
  }

  getDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-CA')
  }


  constructor() { }
}
