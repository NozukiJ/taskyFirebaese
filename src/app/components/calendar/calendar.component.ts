import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CalendarEvent, CalendarView } from 'angular-calendar';
import { TaskService } from '../../core/services/task.service';
import { HolidayService } from '../../core/services/holiday.service';
import { CommonModule } from '@angular/common';
import { CalendarModule, CalendarCommonModule, CalendarMonthModule, CalendarDayModule, CalendarWeekModule, CalendarUtils, DateAdapter, CalendarA11y, CalendarDateFormatter, CalendarEventTitleFormatter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { TaskAddComponent } from '../task-add/task-add.component';
import { TaskDetailComponent } from '../task-detail/task-detail.component';
import { Task } from '../../core/models/task.model';
import { addDays, addWeeks, addMonths, addYears, startOfWeek, endOfWeek, isSameWeek as isSameWeekFn, isSameDay as isSameDayFn, lastDayOfMonth, subDays, isWeekend, set } from 'date-fns';
import { from } from 'rxjs';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    CalendarModule,
    CalendarCommonModule,
    CalendarMonthModule,
    CalendarDayModule,
    CalendarWeekModule
  ],
  providers: [
    CalendarUtils,
    CalendarA11y,
    CalendarDateFormatter,
    CalendarEventTitleFormatter,
    {
      provide: DateAdapter,
      useFactory: adapterFactory
    }
  ],
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {
  view: CalendarView = CalendarView.Week; // デフォルトを週ビューに変更
  viewDate: Date = new Date();
  events: CalendarEvent[] = [];
  holidayEvents: CalendarEvent[] = [];
  allEvents: CalendarEvent[] = [];
  holidays: Date[] = [];

  CalendarView = CalendarView;

  constructor(
    private taskService: TaskService,
    @Inject(HolidayService) private holidayService: HolidayService,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    console.log('Initializing CalendarComponent...');
    this.loadHolidays();
  }

  loadHolidays() {
    console.log("Loading holidays...");
    from(this.holidayService.getHolidays()).subscribe((holidays: { [key: string]: string }) => {
      this.holidays = Object.keys(holidays).map(date => new Date(date));
      this.holidayEvents = this.holidays.map(date => ({
        start: date,
        title: holidays[date.toISOString().split('T')[0]],
        color: { primary: '#e3bc08', secondary: '#FDF1BA' }
      }));
      console.log("Holidays loaded:", this.holidayEvents);
      this.loadEvents();  // 祝日をロードした後にイベントをロードする
      this.updateAllEvents();
    }, (error: any) => { // 明示的にerrorの型を指定
      console.error("Failed to load holidays:", error);
    });
  }

  loadEvents() {
    console.log("Loading events...");
    const tasks = this.taskService.getTasks();
    this.events = this.generateEventsFromTasks(tasks);
    console.log("Events loaded:", this.events);
    this.updateAllEvents();
  }

  generateEventsFromTasks(tasks: Task[]): CalendarEvent[] {
    console.log("Generating events from tasks...");
    const events: CalendarEvent[] = [];
    tasks.forEach(task => {
      if (task.repeatSettings) {
        events.push(...this.generateRecurringEvents(task));
      } else {
        const start = new Date(task.startDateTime);
        const end = new Date(task.endDateTime);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          console.error(`Invalid date for task: ${task.title}`);
          return;
        }

        if (start > end) {
          console.warn(`Start date is after end date for task: ${task.title}`);
          return;
        }

        events.push({
          start,
          end,
          title: task.title,
          color: task.completed ? { primary: '#ad2121', secondary: '#FAE3E3' } : { primary: '#1e90ff', secondary: '#D1E8FF' },
          meta: task
        });
      }
    });
    console.log("Events generated:", events);
    return events;
  }

  generateRecurringEvents(task: Task): CalendarEvent[] {
    console.log("Generating recurring events for task:", task.title);
    const events: CalendarEvent[] = [];
    const start = new Date(task.startDateTime);
    const end = new Date(task.endDateTime);
    const repeatSettings = task.repeatSettings;

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || !repeatSettings) {
      console.error(`Invalid date or repeat settings for task: ${task.title}`);
      return events;
    }

    if (repeatSettings.frequency === 'none') {
      events.push({
        start,
        end,
        title: task.title,
        color: task.completed ? { primary: '#ad2121', secondary: '#FAE3E3' } : { primary: '#1e90ff', secondary: '#D1E8FF' },
        meta: task
      });
      return events;
    }

    let currentStart = start;
    let currentEnd = end;
    const repeatEndDate = repeatSettings.endDate ? new Date(repeatSettings.endDate) : null;

    const maxIterations = 1000;
    let iterations = 0;

    while ((!repeatEndDate || currentStart <= repeatEndDate) && iterations < maxIterations) {
      if (repeatSettings.frequency === 'monthlyFromEnd' && repeatSettings.daysOffsetFromEnd !== undefined) {
        currentStart = this.calculateMonthlyFromEndDate(currentStart, repeatSettings.daysOffsetFromEnd);
        currentStart = set(currentStart, { hours: start.getHours(), minutes: start.getMinutes() });
        currentEnd = set(currentStart, { hours: end.getHours(), minutes: end.getMinutes() });
      }

      if (currentStart > currentEnd) {
        console.warn(`Start date is after end date for recurring task: ${task.title}`);
        return events;
      }

      if (!this.isExcludedDate(currentStart, repeatSettings.excludeDates) &&
          (!repeatSettings.businessDaysOnly || !this.isHolidayOrWeekend(currentStart))) {
        events.push({
          start: currentStart,
          end: currentEnd,
          title: task.title,
          color: task.completed ? { primary: '#ad2121', secondary: '#FAE3E3' } : { primary: '#1e90ff', secondary: '#D1E8FF' },
          meta: task
        });
      }

      let incrementDone = false;
      while (!incrementDone) {
        switch (repeatSettings.frequency) {
          case 'daily':
            currentStart = addDays(currentStart, 1);
            currentEnd = addDays(currentEnd, 1);
            incrementDone = true;
            break;
          case 'weekly':
            currentStart = addWeeks(currentStart, 1);
            currentEnd = addWeeks(currentEnd, 1);
            incrementDone = true;
            break;
          case 'monthly':
            currentStart = addMonths(currentStart, 1);
            currentEnd = addMonths(currentEnd, 1);
            incrementDone = true;
            break;
          case 'yearly':
            currentStart = addYears(currentStart, 1);
            currentEnd = addYears(currentEnd, 1);
            incrementDone = true;
            break;
          case 'monthlyFromEnd':
            currentStart = addMonths(currentStart, 1);
            currentEnd = addMonths(currentEnd, 1);
            currentStart = this.calculateMonthlyFromEndDate(currentStart, repeatSettings.daysOffsetFromEnd ?? 0); // Use 0 as default if undefined
            currentStart = set(currentStart, { hours: start.getHours(), minutes: start.getMinutes() });
            currentEnd = set(currentStart, { hours: end.getHours(), minutes: end.getMinutes() });
            incrementDone = true;
            break;
          default:
            console.warn(`Unknown repeat frequency: ${repeatSettings.frequency}`);
            iterations = maxIterations; // Prevent infinite loop
            incrementDone = true;
        }
        if (repeatSettings.businessDaysOnly && this.isHolidayOrWeekend(currentStart)) {
          incrementDone = false;
        }
      }

      iterations++;
    }

    if (iterations === maxIterations) {
      console.warn(`Max iterations reached for task: ${task.title}`);
    }

    console.log("Recurring events generated:", events);
    return events;
  }

  private isExcludedDate(date: Date, excludeDates?: string[]): boolean {
    if (!excludeDates) return false;
    return excludeDates.some(excludeDate => {
      const exclude = new Date(excludeDate);
      return date.getFullYear() === exclude.getFullYear() &&
             date.getMonth() === exclude.getMonth() &&
             date.getDate() === exclude.getDate();
    });
  }

  calculateMonthlyFromEndDate(date: Date, offset: number): Date {
    let targetDate = subDays(lastDayOfMonth(date), offset);
    let additionalOffset = 0;

    for (let d = subDays(lastDayOfMonth(date), offset); d <= lastDayOfMonth(date); d = addDays(d, 1)) {
      if (this.isHolidayOrWeekend(d)) {
        additionalOffset++;
      }
    }

    targetDate = subDays(targetDate, additionalOffset);

    while (this.isHolidayOrWeekend(targetDate)) {
      targetDate = subDays(targetDate, 1);
    }

    console.log(`Final target date: ${targetDate}`);
    return targetDate;
  }

  isHolidayOrWeekend(date: Date): boolean {
    const day = date.getDay();
    const isWeekend = day === 0 || day === 6;
    const isHoliday = this.holidays.some(holiday => 
      holiday.getFullYear() === date.getFullYear() &&
      holiday.getMonth() === date.getMonth() &&
      holiday.getDate() === date.getDate()
    );
    console.log(`Date: ${date}, isWeekend: ${isWeekend}, isHoliday: ${isHoliday}`);
    return isWeekend || isHoliday;
  }

  updateAllEvents() {
    this.allEvents = [...this.events, ...this.holidayEvents];
    console.log("All events updated:", this.allEvents);
  }

  getNonHolidayEvents(): CalendarEvent[] {
    return this.allEvents.filter(event => !this.holidayEvents.some(holiday => holiday.start.getTime() === event.start.getTime()));
  }

  handleEvent(action: string, event: CalendarEvent): void {
    console.log(`Event ${action} - ${event.title}`);
    if (event.meta) {
      const dialogRef = this.dialog.open(TaskDetailComponent, {
        width: '600px',
        maxHeight: '80vh',
        panelClass: 'custom-dialog-container',
        data: { task: event.meta }
      });

      dialogRef.afterClosed().subscribe((result: Task) => {
        if (result) {
          console.log('Event details updated:', result);
          this.taskService.saveTasks();
          this.loadEvents();
        }
      });
    }
  }

  setView(view: CalendarView) {
    console.log(`View changed to ${view}`);
    this.view = view;
  }

  addTask(): void {
    console.log('Adding new task...');
    const dialogRef = this.dialog.open(TaskAddComponent, {
      width: '600px',
      maxHeight: '80vh',
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('New task added:', result);
        this.loadEvents();
      }
    });
  }

  previousPeriod(): void {
    console.log('Moving to previous period...');
    switch (this.view) {
      case CalendarView.Month:
        this.viewDate = new Date(this.viewDate.setMonth(this.viewDate.getMonth() - 1));
        break;
      case CalendarView.Week:
        this.viewDate = new Date(this.viewDate.setDate(this.viewDate.getDate() - 7));
        break;
      case CalendarView.Day:
        this.viewDate = new Date(this.viewDate.setDate(this.viewDate.getDate() - 1));
        break;
    }
    console.log('New view date:', this.viewDate);
  }

  nextPeriod(): void {
    console.log('Moving to next period...');
    switch (this.view) {
      case CalendarView.Month:
        this.viewDate = new Date(this.viewDate.setMonth(this.viewDate.getMonth() + 1));
        break;
      case CalendarView.Week:
        this.viewDate = new Date(this.viewDate.setDate(this.viewDate.getDate() + 7));
        break;
      case CalendarView.Day:
        this.viewDate = new Date(this.viewDate.setDate(this.viewDate.getDate() + 1));
        break;
    }
    console.log('New view date:', this.viewDate);
  }

  getWeekRange(): string {
    const start = startOfWeek(this.viewDate);
    const end = endOfWeek(this.viewDate);
    return `${start.getFullYear()}年${('0' + (start.getMonth() + 1)).slice(-2)}月${('0' + start.getDate()).slice(-2)}日～${end.getFullYear()}年${('0' + (end.getMonth() + 1)).slice(-2)}月${('0' + end.getDate()).slice(-2)}日`;
  }

  isSameWeek(date1: Date, date2: Date): boolean {
    return isSameWeekFn(date1, date2);
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return isSameDayFn(date1, date2);
  }
}
