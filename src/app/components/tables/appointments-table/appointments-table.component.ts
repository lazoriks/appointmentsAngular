import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AdminService } from '../../../services/admin.service';
import { Appointment } from '../../../models/appointment.model';

interface MasterGroup {
  masterName: string;
  totalSum: number;
  appointments: Appointment[];
  collapsed: boolean;
}

interface DayGroup {
  date: string;
  weekday: string;
  totalSum: number;
  masters: MasterGroup[];
  collapsed: boolean;
}

interface WeekGroup {
  weekNumber: number;
  weekRange: string;
  totalSum: number;
  days: DayGroup[];
  collapsed: boolean;
}

@Component({
  standalone: true,
  selector: 'app-appointments-table',
  imports: [CommonModule, FormsModule],
  styleUrls: ['./appointments-table.component.scss'],
  template: `
    <div class="card" style="margin-bottom:12px;">
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
        <label style="display:flex;align-items:center;gap:6px;">
          <span>From:</span>
          <input type="date" [(ngModel)]="from" class="input" />
        </label>
        <label style="display:flex;align-items:center;gap:6px;">
          <span>To:</span>
          <input type="date" [(ngModel)]="to" class="input" />
        </label>

        <button class="btn primary" (click)="filter()">Filter</button>
        <button class="btn" (click)="reset()">Reset</button>
        <button class="btn success" (click)="openAdd()">Add Appointment</button>

        <button class="btn info" (click)="toggleAll()">
          {{ allCollapsed ? 'Expand All' : 'Collapse All' }}
        </button>
      </div>
    </div>

    <div class="card" *ngIf="weeksGrouped.length">
      <div *ngFor="let week of weeksGrouped">
        <!-- Week Header -->
        <div class="week-header" (click)="toggleWeek(week)">
          📅 <b>Week {{ week.weekNumber }}</b> — {{ week.weekRange }}
          <span class="sum">Total: {{ week.totalSum | number:'1.2-2' }} €</span>
          <span class="arrow">{{ week.collapsed ? '▶' : '▼' }}</span>
        </div>

        <div *ngIf="!week.collapsed" class="week-block">
          <!-- Days -->
          <div *ngFor="let day of week.days">
            <div class="day-header" (click)="toggleDay(day)">
              📅 <b>{{ day.weekday }}</b> — {{ day.date }}
              <span class="sum">Total: {{ day.totalSum | number:'1.2-2' }} €</span>
              <span class="arrow">{{ day.collapsed ? '▶' : '▼' }}</span>
            </div>

            <div *ngIf="!day.collapsed" class="day-block">
              <!-- Masters -->
              <div *ngFor="let m of day.masters" class="master-block">
                <div class="master-header" (click)="toggleMaster(m)">
                  👩‍🎨 {{ m.masterName }}
                  <span class="sum">{{ m.totalSum | number:'1.2-2' }} €</span>
                  <span class="arrow">{{ m.collapsed ? '▶' : '▼' }}</span>
                </div>

                <table class="table" *ngIf="!m.collapsed">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Time</th>
                      <th>Client</th>
                      <th>Services</th>
                      <th>Sum</th>
                      <th>Created</th>
                      <th style="width:150px;">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let a of m.appointments; let i = index">
                      <td>{{ i + 1 }}</td>
                      <td>{{ a.datatime | date:'HH:mm' }}</td>
                      <td>{{ a.client?.firstName }} {{ a.client?.surname }}</td>
                      <td>{{ servicesToString(a) }}</td>
                      <td>{{ a.summ | number:'1.2-2' }} €</td>
                      <td>{{ a.date_created | date:'dd.MM.yy HH:mm' }}</td>
                      <td>
                        <button class="btn small" (click)="openEdit(a)">Edit</button>
                        <button class="btn small danger" (click)="del(a.id)">Delete</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div *ngIf="!weeksGrouped.length && !loading" style="padding:16px;">No appointments found</div>
    <div *ngIf="loading" style="padding:16px;">Loading...</div>
  `
})
export class AppointmentsTableComponent implements OnInit {
  rows: Appointment[] = [];
  grouped: DayGroup[] = [];
  weeksGrouped: WeekGroup[] = [];
  from = '';
  to = '';
  allCollapsed = true;
  loading = false;

  constructor(
    private api: AdminService,
    private router: Router
  ) {}

  ngOnInit() {
    this.setDefaultDates();
    this.filter();
  }

  setDefaultDates() {
    const today = new Date();
    const dow = today.getDay(); 
    const diff = dow === 0 ? -6 : 1 - dow;

    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);

    const end = new Date(monday);
    end.setDate(monday.getDate() + 14);

    this.from = monday.toISOString().split('T')[0];
    this.to = end.toISOString().split('T')[0];
  }

  reset() {
    this.setDefaultDates();
    this.filter();
  }

  filter() {
    this.loading = true;
    this.api.getAppointments(this.from, this.to).subscribe({
      next: data => {
        this.processData(data);
        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  /** GROUPING LOGIC */
  processData(data: Appointment[]) {
    this.rows = data;

    const daysMap: { [date: string]: DayGroup } = {};

    for (const a of data) {
      const d = new Date(a.datatime);
      const dayStr = d.toISOString().split('T')[0];
      const weekday = d.toLocaleDateString('en-US', { weekday: 'long' });
      const masterName = `${a.master?.firstName || ''} ${a.master?.surname || ''}`.trim();

      if (!daysMap[dayStr]) {
        daysMap[dayStr] = {
          date: dayStr,
          weekday,
          totalSum: 0,
          masters: [],
          collapsed: this.allCollapsed
        };
      }

      let m = daysMap[dayStr].masters.find(x => x.masterName === masterName);
      if (!m) {
        m = { masterName, totalSum: 0, appointments: [], collapsed: this.allCollapsed };
        daysMap[dayStr].masters.push(m);
      }

      m.appointments.push(a);
      m.totalSum += a.summ || 0;
      daysMap[dayStr].totalSum += a.summ || 0;
    }

    /** SORT days + appointments */
    this.grouped = Object.values(daysMap)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(day => {
        day.masters.forEach(m =>
          m.appointments.sort(
            (a, b) => new Date(a.datatime).getTime() - new Date(b.datatime).getTime()
          )
        );
        return day;
      });

    this.groupByWeeks();
  }

  /** Групування по тижнях */
  groupByWeeks() {
    const weeksMap: { [weekKey: string]: WeekGroup } = {};

    for (const day of this.grouped) {
      const date = new Date(day.date);
      const weekNumber = this.getWeekNumber(date);
      const weekStart = this.getWeekStart(date);
      const weekEnd = this.getWeekEnd(date);
      const weekRange = `${this.formatDate(weekStart)} - ${this.formatDate(weekEnd)}`;
      const weekKey = `${weekStart.toISOString().split('T')[0]}`;

      if (!weeksMap[weekKey]) {
        weeksMap[weekKey] = {
          weekNumber,
          weekRange,
          totalSum: 0,
          days: [],
          collapsed: this.allCollapsed
        };
      }

      weeksMap[weekKey].days.push(day);
      weeksMap[weekKey].totalSum += day.totalSum;
    }

    this.weeksGrouped = Object.values(weeksMap)
      .sort((a, b) => a.weekNumber - b.weekNumber)
      .map(week => {
        week.days.sort((a, b) => a.date.localeCompare(b.date));
        return week;
      });
  }

  /** Отримати номер тижня */
  getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  /** Отримати початок тижня (понеділок) */
  getWeekStart(date: Date): Date {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  }

  /** Отримати кінець тижня (неділя) */
  getWeekEnd(date: Date): Date {
    const start = this.getWeekStart(date);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return end;
  }

  /** Форматування дати */
  formatDate(date: Date): string {
    return date.toLocaleDateString('en-GB');
  }

  toggleWeek(week: WeekGroup) {
    week.collapsed = !week.collapsed;
  }

  toggleDay(day: DayGroup) {
    day.collapsed = !day.collapsed;
  }

  toggleMaster(m: MasterGroup) {
    m.collapsed = !m.collapsed;
  }

  toggleAll() {
    this.allCollapsed = !this.allCollapsed;
    this.weeksGrouped.forEach(week => {
      week.collapsed = this.allCollapsed;
      week.days.forEach(day => {
        day.collapsed = this.allCollapsed;
        day.masters.forEach(m => (m.collapsed = this.allCollapsed));
      });
    });
  }

  /** SERVICES STRING */
  servicesToString(a: Appointment): string {
    if (a.services?.length) {
      return a.services.map(s => s.serviceName).join(', ');
    }
    return a.service?.serviceName || '-';
  }

  /** ROUTING */
  openAdd() {
    this.router.navigate(['/edit/appointment', 'new']);
  }

  openEdit(a: Appointment) {
    this.router.navigate(['/edit/appointment', a.id]);
  }

  del(id: number) {
    if (!confirm('Delete appointment?')) return;
    this.api.deleteAppointment(id).subscribe({
      next: () => this.filter(),
      error: err => console.error('Error deleting appointment:', err)
    });
  }
}