import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HolidayService {
  private apiUrl = 'https://holidays-jp.github.io/api/v1/date.json'; // 国民の祝日APIのエンドポイント

  constructor() {}

  async getHolidays(): Promise<any> {
    try {
      const response = await fetch(this.apiUrl);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return await response.json();
    } catch (error) {
      console.error('There was an error fetching the holidays:', error);
      throw error;
    }
  }
}
