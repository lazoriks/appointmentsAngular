import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { AdminService } from '../../../services/admin.service';

@Component({
  standalone: true,
  selector: 'app-appointments-table',
  imports: [],
  styleUrls: ['./appointments-table.component.scss'],
  template: `
    <div class="card" style="margin-bottom:12px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
      <label>From: <input type="date" [(ngModel)]="from" /></label>
      <label>To: <input type="date" [(ngModel)]="to" /></label>
      <button class="btn primary" (click)="filter()">Filter</button>
      <button class="btn" (click)="refresh()">Reset</button>
      <button class="btn success" (click)="openAdd()">Add Appointment</button>
    </div>

    <div class="card">
      <table class="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Date/Time</th>
            <th>Client</th>
            <th>Master</th>
            <th>Service</th>
            <th>Sum</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          @for (a of rows; track a.id) {
            <tr>
              <td>{{ rows.indexOf(a) + 1 }}</td>
              <td>{{ a.datatime | date:'yyyy-MM-dd HH:mm' }}</td>
              <td>{{ a.client?.firstName }} {{ a.client?.surname }}</td>
              <td>{{ a.master?.firstName }} {{ a.master?.surname }}</td>
              <td>{{ a.service?.serviceName }}</td>
              <td>{{ a.summ }}</td>
              <td>
                <button class="btn" (click)="openEdit(a)">Edit</button>
                <button class="btn danger" (click)="del(a.id)">Delete</button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `
})
export class AppointmentsTableComponent implements OnInit, OnDestroy {
  rows: any[] = [];
  from: string = '';
  to: string = '';

  constructor(private api: AdminService, private zone: NgZone) {}

  ngOnInit() {
    this.refresh();
    window.addEventListener('message', this.onMessage);
  }

  ngOnDestroy() {
    window.removeEventListener('message', this.onMessage);
  }

  refresh() {
    this.api.getAppointments().subscribe({
      next: (d) => (this.rows = d),
      error: (err) => console.error('Error loading appointments:', err)
    });
  }

  filter() {
    this.api.getAppointments(this.from, this.to).subscribe({
      next: (d) => (this.rows = d),
      error: (err) => console.error('Error filtering appointments:', err)
    });
  }

  /** ---------- ADD ---------- */
  openAdd() {
    console.log('openAdd clicked');
    this.zone.runOutsideAngular(() => {
      const win = window.open('', '_blank', 'width=640,height=540,menubar=no,toolbar=no');
      if (!win) {
        alert('Pop-ups are blocked. Please allow them in browser settings.');
        return;
      }

      setTimeout(() => {
        win.document.write(`
          <html>
            <head>
              <title>Add Appointment</title>
              <style>
                body{font-family:sans-serif;padding:20px;}
                label{display:block;margin-top:10px;font-weight:600;}
                input{width:100%;padding:6px;margin-top:4px;}
                button{margin-top:12px;padding:8px 14px;cursor:pointer;}
              </style>
            </head>
            <body>
              <h2>Add Appointment</h2>
              <form id="form">
                <label>Date/Time</label><input id="datatime" type="datetime-local" required>
                <label>Service ID</label><input id="serviceId" type="number" required>
                <label>Client ID</label><input id="clientId" type="number" required>
                <label>Master ID</label><input id="masterId" type="number" required>
                <label>Sum</label><input id="summ" type="number" required>
                <button type="submit">Save</button>
              </form>
              <script>
                const f=document.getElementById('form');
                f.addEventListener('submit',e=>{
                  e.preventDefault();
                  const payload={
                    datatime:document.getElementById('datatime').value,
                    service:{id:Number(document.getElementById('serviceId').value)},
                    client:{id:Number(document.getElementById('clientId').value)},
                    master:{id:Number(document.getElementById('masterId').value)},
                    summ:Number(document.getElementById('summ').value)
                  };
                  window.opener.postMessage({type:'save-appointment',payload},'*');
                  window.close();
                });
              <\\/script>
            </body>
          </html>
        `);
        win.document.close();
      }, 0);
    });
  }

  /** ---------- EDIT ---------- */
  openEdit(a: any) {
    console.log('openEdit clicked', a);
    this.zone.runOutsideAngular(() => {
      const win = window.open('', '_blank', 'width=640,height=540,menubar=no,toolbar=no');
      if (!win) {
        alert('Pop-ups are blocked. Please allow them in browser settings.');
        return;
      }

      setTimeout(() => {
        win.document.write(`
          <html>
            <head>
              <title>Edit Appointment</title>
              <style>
                body{font-family:sans-serif;padding:20px;}
                label{display:block;margin-top:10px;font-weight:600;}
                input{width:100%;padding:6px;margin-top:4px;}
                button{margin-top:12px;padding:8px 14px;cursor:pointer;}
              </style>
            </head>
            <body>
              <h2>Edit Appointment</h2>
              <form id="form">
                <label>Date/Time</label><input id="datatime" type="datetime-local" value="${this.toLocal(a.datatime)}" required>
                <label>Service ID</label><input id="serviceId" type="number" value="${a.service?.id}" required>
                <label>Client ID</label><input id="clientId" type="number" value="${a.client?.id}" required>
                <label>Master ID</label><input id="masterId" type="number" value="${a.master?.id}" required>
                <label>Sum</label><input id="summ" type="number" value="${a.summ}" required>
                <button type="submit">Save</button>
              </form>
              <script>
                const f=document.getElementById('form');
                f.addEventListener('submit',e=>{
                  e.preventDefault();
                  const payload={
                    id:${a.id},
                    datatime:document.getElementById('datatime').value,
                    service:{id:Number(document.getElementById('serviceId').value)},
                    client:{id:Number(document.getElementById('clientId').value)},
                    master:{id:Number(document.getElementById('masterId').value)},
                    summ:Number(document.getElementById('summ').value)
                  };
                  window.opener.postMessage({type:'save-appointment',payload},'*');
                  window.close();
                });
              <\\/script>
            </body>
          </html>
        `);
        win.document.close();
      }, 0);
    });
  }

  /** ---------- MESSAGE HANDLER ---------- */
  onMessage = (e: MessageEvent) => {
    if (e.data?.type === 'save-appointment') {
      console.log('Received appointment from popup:', e.data.payload);
      this.api.saveAppointment(e.data.payload).subscribe({
        next: () => this.refresh(),
        error: (err) => console.error('Error saving appointment:', err)
      });
    }
  };

  /** ---------- DELETE ---------- */
  del(id: number) {
    if (!confirm('Delete appointment?')) return;
    this.api.deleteAppointment(id).subscribe({
      next: () => this.refresh(),
      error: (err) => console.error('Error deleting appointment:', err)
    });
  }

  /** ---------- Helpers ---------- */
  toLocal(dt: string): string {
    if (!dt) return '';
    const d = new Date(dt);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
}
