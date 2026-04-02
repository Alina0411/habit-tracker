import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'declension'
})
// Склонение слов по числам (1 день, 2 дня, 5 дней)
export class DeclensionPipe implements PipeTransform {


  transform(value: number, type: string): string {
    const dictionary: Record<string, [string, string, string]> = {
      day: ['день', 'дня', 'дней'],
      week: ['неделя', 'недели', 'недель'],
      month: ['месяц', 'месяца', 'месяцев'],
    };

    const forms = dictionary[type];

    if (!forms) {
      console.warn(`Нет склонений для типа: ${type}`);
      return `${value}`;
    }

    const mod10 = value % 10;
    const mod100 = value % 100;
    let word = forms[2];

    if (mod10 === 1 && mod100 !== 11) {
      word = forms[0];
    } else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
      word = forms[1];
    }

    return `${value} ${word}`;
  }

}
