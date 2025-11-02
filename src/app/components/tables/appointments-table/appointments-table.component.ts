import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';

interface MasterGroup {
  masterName: string;
  totalSum: number;
  appointments: any[];
  collapsed: boolean;
}

interface DayGroup {
  date: string;
  weekday: string;
  totalSum: number;
  masters: MasterGroup[];
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
        <button class="btn" (click)="refresh()">Reset</button>
        <button class="btn success" (click)="openAdd()">Add Appointment</button>
        <button class="btn info" (click)="toggleAll()">
          {{ allCollapsed ? 'Expand All' : 'Collapse All' }}
        </button>
      </div>
    </div>

    <div class="card" *ngIf="grouped.length">
      <div *ngFor="let day of grouped">
        <div class="day-header" (click)="toggleDay(day)">
          📅 <b>{{ day.weekday }}</b> — {{ day.date }}
          <span class="sum">Total: {{ day.totalSum | number:'1.0-0' }} €</span>
          <span class="arrow">{{ day.collapsed ? '▶' : '▼' }}</span>
        </div>

        <div *ngIf="!day.collapsed" class="day-block">
          <div *ngFor="let m of day.masters" class="master-block">
            <div class="master-header" (click)="toggleMaster(m)">
              👩‍🎨 {{ m.masterName }}
              <span class="sum">{{ m.totalSum | number:'1.0-0' }} €</span>
              <span class="arrow">{{ m.collapsed ? '▶' : '▼' }}</span>
            </div>

            <table class="table" *ngIf="!m.collapsed">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Time</th>
                  <th>Client</th>
                  <th>Service</th>
                  <th>Sum</th>
                  <th style="width:150px;">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let a of m.appointments; let i = index">
                  <td>{{ i + 1 }}</td>
                  <td>{{ a.datatime | date:'HH:mm' }}</td>
                  <td>{{ a.client?.firstName }} {{ a.client?.surname }}</td>
                  <td>{{ a.service?.serviceName }}</td>
                  <td>{{ a.summ }}</td>
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

    <div *ngIf="!grouped.length" style="padding:16px;">No appointments found</div>
  `,
  styles: [`
    .day-header, .master-header {
      display:flex;
      align-items:center;
      justify-content:space-between;
      background:#f0f7ff;
      padding:10px 14px;
      margin-top:10px;
      border-radius:10px;
      cursor:pointer;
      transition: background 0.2s ease;
      user-select:none;
      font-weight:500;
    }
    .master-header {
      background:#f9f9f9;
      border:1px solid #ddd;
      margin:6px 0 0 12px;
      border-radius:8px;
    }
    .day-header:hover { background:#e1efff; }
    .master-header:hover { background:#f0f0f0; }
    .day-block { margin-left:8px; }
    .table { margin-top:6px; width:100%; border-collapse:collapse; border-radius:8px; overflow:hidden; }
    .table th { background:#f7f7f7; text-align:left; padding:8px; border-bottom:2px solid #ddd; }
    .table td { padding:6px 8px; border-bottom:1px solid #eee; }
    .sum { color:#777; margin-left:10px; }
    .arrow { float:right; font-weight:bold; cursor:pointer; }
    .btn.small { padding:4px 8px; font-size:13px; margin-right:4px; }
    .btn.info { background:#0078d4; color:white; }
    .btn.info:hover { background:#005fa3; }
  `]
})
export class AppointmentsTableComponent implements OnInit, OnDestroy {
  rows: any[] = [];
  grouped: DayGroup[] = [];
  from = '';
  to = '';
  allCollapsed = true; // ✅ початково все згорнуте

  constructor(private api: AdminService, private zone: NgZone) {}

  ngOnInit() {
    this.setWeekDates();
    this.filter(); // ✅ автоматично завантажує дані при відкритті
    window.addEventListener('message', this.onMessage);
  }

  ngOnDestroy() {
    window.removeEventListener('message', this.onMessage);
  }

  /** === встановлення поточного тижня === **/
  setWeekDates() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // неділя = 0, понеділок = 1
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMonday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    this.from = monday.toISOString().split('T')[0];
    this.to = sunday.toISOString().split('T')[0];
  }

  /** === Групування по днях -> по майстрах === **/
  processData(data: any[]) {
    this.rows = data;
    const daysMap: { [key: string]: DayGroup } = {};

    for (const a of data) {
      const date = new Date(a.datatime);
      const dayStr = date.toISOString().split('T')[0];
      const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
      const masterName = (a.master?.firstName || '') + ' ' + (a.master?.surname || '');

      if (!daysMap[dayStr]) {
        daysMap[dayStr] = {
          date: dayStr,
          weekday,
          totalSum: 0,
          masters: [],
          collapsed: this.allCollapsed
        };
      }

      let mGroup = daysMap[dayStr].masters.find(m => m.masterName === masterName);
      if (!mGroup) {
        mGroup = { masterName, totalSum: 0, appointments: [], collapsed: this.allCollapsed };
        daysMap[dayStr].masters.push(mGroup);
      }

      mGroup.appointments.push(a);
      mGroup.totalSum += a.summ || 0;
      daysMap[dayStr].totalSum += a.summ || 0;
    }

    // ✅ сортування: по датах, по часу всередині дня
    this.grouped = Object.values(daysMap)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(day => {
        day.masters.forEach(m =>
          m.appointments.sort((a, b) =>
            new Date(a.datatime).getTime() - new Date(b.datatime).getTime()
          )
        );
        return day;
      });
  }

  filter() {
    this.api.getAppointments(this.from, this.to).subscribe({
      next: (data) => this.processData(data),
      error: (err) => console.error(err)
    });
  }

  refresh() {
    this.setWeekDates();  // поточний тиждень
    this.filter();        // перезапит даних
  }

  toggleDay(day: DayGroup) { day.collapsed = !day.collapsed; }
  toggleMaster(m: MasterGroup) { m.collapsed = !m.collapsed; }

  toggleAll() {
    this.allCollapsed = !this.allCollapsed;
    this.grouped.forEach(day => {
      day.collapsed = this.allCollapsed;
      day.masters.forEach(m => (m.collapsed = this.allCollapsed));
    });
  }

  onMessage = (e: MessageEvent) => {
    if (e.data?.type === 'save-appointment') {
      this.api.saveAppointment(e.data.payload).subscribe({
        next: () => this.filter(),
        error: (err) => console.error(err)
      });
    }
  };

  openAdd() {
  Promise.all([
    this.api.getClients().toPromise(),
    this.api.getMasters().toPromise(),
    this.api.getServices().toPromise()
  ]).then(([clients = [], masters = [], services = []]) => {
    if (!clients || !masters || !services) return;

    const win = window.open('', '_blank', 'width=640,height=600');
    if (!win) return;

    const today = new Date().toISOString().slice(0, 16);

    const clientOptions = clients!.map((c: any) =>
      `<option value="${c.id}">${c.firstName} ${c.surname}</option>`).join('');
    const masterOptions = masters!.map((m: any) =>
      `<option value="${m.id}">${m.firstName} ${m.surname}</option>`).join('');
    const serviceOptions = services!.map((s: any) =>
      `<option value="${s.id}">${s.serviceName} (€${s.price})</option>`).join('');

    win.document.write(`
      <html><head><title>Add Appointment</title>
      <style>
        body { font-family: sans-serif; padding: 20px; }
        label { display:block; margin-top:10px; font-weight:500; }
        input, select { width:100%; padding:6px; margin-top:4px; }
        button { margin-top:14px; padding:8px 12px; cursor:pointer; }
      </style></head><body>
        <h2>Add Appointment</h2>
        <form id="form">
          <label>Date & Time</label>
          <input type="datetime-local" id="datatime" value="${today}" required>

          <label>Client</label>
          <select id="clientId" required>
            <option value="">-- Select Client --</option>
            ${clientOptions}
          </select>

          <label>Master</label>
          <select id="masterId" required>
            <option value="">-- Select Master --</option>
            ${masterOptions}
          </select>

          <label>Service</label>
          <select id="serviceId" required>
            <option value="">-- Select Service --</option>
            ${serviceOptions}
          </select>

          <label>Sum (€)</label>
          <input id="summ" type="number" placeholder="Enter amount" required>

          <button type="submit">💾 Save</button>
        </form>

        <script>
          const f = document.getElementById('form');
          const serviceSelect = document.getElementById('serviceId');
          const sumInput = document.getElementById('summ');

          // Автопідстановка ціни сервісу
          const serviceMap = ${JSON.stringify(services!.map((s: any) => ({ id: s.id, price: s.price })))};
          serviceSelect.addEventListener('change', () => {
            const sel = serviceMap.find(s => s.id == serviceSelect.value);
            if (sel) sumInput.value = sel.price;
          });

          f.addEventListener('submit', e => {
            e.preventDefault();
            const payload = {
              datatime: document.getElementById('datatime').value,
              client: { id: parseInt(document.getElementById('clientId').value) },
              master: { id: parseInt(document.getElementById('masterId').value) },
              service: { id: parseInt(document.getElementById('serviceId').value) },
              summ: parseFloat(document.getElementById('summ').value)
            };
            window.opener.postMessage({ type: 'save-appointment', payload }, '*');
            window.close();
          });
        </script>
      </body></html>
    `);
    win.document.close();
  });
}

openEdit(a: any) {
  Promise.all([
    this.api.getClients().toPromise(),
    this.api.getMasters().toPromise(),
    this.api.getServices().toPromise()
  ]).then(([clients = [], masters = [], services = []]) => {
    if (!clients || !masters || !services) return;

    const win = window.open('', '_blank', 'width=640,height=600');
    if (!win) return;

    const datetimeValue = new Date(a.datatime).toISOString().slice(0, 16);

    const clientOptions = clients!.map((c: any) =>
      `<option value="${c.id}" ${a.client?.id === c.id ? 'selected' : ''}>${c.firstName} ${c.surname}</option>`).join('');
    const masterOptions = masters!.map((m: any) =>
      `<option value="${m.id}" ${a.master?.id === m.id ? 'selected' : ''}>${m.firstName} ${m.surname}</option>`).join('');
    const serviceOptions = services!.map((s: any) =>
      `<option value="${s.id}" ${a.service?.id === s.id ? 'selected' : ''}>${s.serviceName} (€${s.price})</option>`).join('');

    win.document.write(`
      <html><head><title>Edit Appointment</title>
      <style>
        body { font-family: sans-serif; padding: 20px; }
        label { display:block; margin-top:10px; font-weight:500; }
        input, select { width:100%; padding:6px; margin-top:4px; }
        button { margin-top:14px; padding:8px 12px; cursor:pointer; }
      </style></head><body>
        <h2>Edit Appointment</h2>
        <form id="form">
          <label>Date & Time</label>
          <input type="datetime-local" id="datatime" value="${datetimeValue}" required>

          <label>Client</label>
          <select id="clientId" required>${clientOptions}</select>

          <label>Master</label>
          <select id="masterId" required>${masterOptions}</select>

          <label>Service</label>
          <select id="serviceId" required>${serviceOptions}</select>

          <label>Sum (€)</label>
          <input id="summ" type="number" value="${a.summ || ''}" required>

          <button type="submit">💾 Save</button>
        </form>

        <script>
          const f = document.getElementById('form');
          const serviceSelect = document.getElementById('serviceId');
          const sumInput = document.getElementById('summ');

          const serviceMap = ${JSON.stringify(services!.map((s: any) => ({ id: s.id, price: s.price })))};
          serviceSelect.addEventListener('change', () => {
            const sel = serviceMap.find(s => s.id == serviceSelect.value);
            if (sel) sumInput.value = sel.price;
          });

          f.addEventListener('submit', e => {
            e.preventDefault();
            const payload = {
              id: ${a.id},
              datatime: document.getElementById('datatime').value,
              client: { id: parseInt(document.getElementById('clientId').value) },
              master: { id: parseInt(document.getElementById('masterId').value) },
              service: { id: parseInt(document.getElementById('serviceId').value) },
              summ: parseFloat(document.getElementById('summ').value)
            };
            window.opener.postMessage({ type: 'save-appointment', payload }, '*');
            window.close();
          });
        </script>
      </body></html>
    `);
    win.document.close();
  });
}
  
  del(id: number) {
    if (!confirm('Delete appointment?')) return;
    this.api.deleteAppointment(id).subscribe({ next: () => this.filter() });
  }
}
