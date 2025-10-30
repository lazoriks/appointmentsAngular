import { Component, OnInit, OnDestroy } from '@angular/core';
import { AdminService } from '../../../services/admin.service';

@Component({
  standalone: true,
  selector: 'app-appointments-table',
  imports: [],
  styleUrls: ['./appointments-table.component.scss'],
  template: `
    <div class="card" style="margin-bottom:12px;">
      <button class="btn primary" (click)="openAdd()">Add Appointment</button>
      <button class="btn" (click)="refresh()">Refresh</button>
    </div>

    <div class="card">
      <table class="table">
        <thead>
          <tr><th>#</th><th>Client</th><th>Master</th><th>Service</th><th>Start</th></tr>
        </thead>
        <tbody>
          @for (a of rows; track a.id) {
            <tr>
              <td>{{ rows.indexOf(a) + 1 }}</td>
              <td>{{ a.client?.firstName }} {{ a.client?.surname }}</td>
              <td>{{ a.master?.firstName }} {{ a.master?.surname }}</td>
              <td>{{ a.service?.serviceName }}</td>
              <td>{{ a.startTime }}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `
})
export class AppointmentsTableComponent implements OnInit, OnDestroy {
  rows: any[] = [];
  constructor(private api: AdminService) {}

  ngOnInit() {
    this.refresh();
    window.addEventListener('message', this.onMessage);
  }
  ngOnDestroy() {
    window.removeEventListener('message', this.onMessage);
  }

  refresh() {
    this.api.getAppointments().subscribe({ next: d => this.rows = d });
  }

  openAdd() {
    this.openFormWindow('Add Appointment', {});
  }

  openEdit(a: any) {
    this.openFormWindow('Edit Appointment', a);
  }

  openFormWindow(title: string, data: any) {
    const win = window.open('', '_blank', 'width=640,height=500');
    if (!win) return;

    win.document.write(`
      <html><head><title>${title}</title>
      <style>body{font-family:sans-serif;padding:20px;}label{display:block;margin-top:10px;}</style></head>
      <body>
      <h2>${title}</h2>
      <form id="form">
        <label>Client ID</label><input id="clientId" type="number" value="${data.clientId || ''}" required>
        <label>Master ID</label><input id="masterId" type="number" value="${data.masterId || ''}" required>
        <label>Service ID</label><input id="serviceId" type="number" value="${data.serviceId || ''}" required>
        <label>Start Time</label><input id="startTime" type="datetime-local" value="${this.toLocalValue(data.startTime)}" required>
        <button type="submit">Save</button>
      </form>
      <script>
        const f=document.getElementById('form');
        f.addEventListener('submit',e=>{
          e.preventDefault();
          window.opener.postMessage({type:'refresh-appointments'},'*');
          window.close();
        });
      </script>
      </body></html>
    `);
    win.document.close();
  }

  toLocalValue(dt: any): string {
    if (!dt) return '';
    const d = new Date(dt);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  onMessage = (e: MessageEvent) => {
    if (e.data?.type === 'refresh-appointments') {
      this.refresh();
    }
  }
}
