import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { ServiceModel } from '../../../models/service.model';

@Component({
  standalone: true,
  selector: 'app-services-table',
  imports: [],
  styleUrls: ['./services-table.component.scss'],
  template: `
    <div class="card" style="margin-bottom:12px;">
      <button class="btn primary" (click)="openAdd()">Add Service</button>
      <button class="btn" (click)="refresh()">Refresh</button>
    </div>

    <div class="card">
      <table class="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Price</th>
            <th>Period</th>
            <th>Description</th>
            <th>GroupId</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          @for (s of rows; track s.id) {
            <tr>
              <td>{{ rows.indexOf(s) + 1 }}</td>
              <td>{{ s.serviceName }}</td>
              <td>{{ s.price }}</td>
              <td>{{ s.period }}</td>
              <td>{{ s.description || '-' }}</td>
              <td>{{ s.groupServiceId || '-' }}</td>
              <td>
                <button class="btn" (click)="openEdit(s)">Edit</button>
                <button class="btn danger" (click)="del(s.id)">Delete</button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `
})
export class ServicesTableComponent implements OnInit, OnDestroy {
  rows: ServiceModel[] = [];

  constructor(private api: AdminService, private zone: NgZone) {}

  ngOnInit() {
    this.refresh();
    window.addEventListener('message', this.onMessage);
  }

  ngOnDestroy() {
    window.removeEventListener('message', this.onMessage);
  }

  refresh() {
    this.api.getServices().subscribe({
      next: (d) => (this.rows = d),
      error: (err) => console.error('Failed to load services:', err)
    });
  }

  // ----------- ADD -----------
  openAdd() {
    console.log('openAdd called');

    this.zone.runOutsideAngular(() => {
      const win = window.open('', '_blank', 'width=640,height=520,menubar=no,toolbar=no');
      if (!win) {
        alert('Pop-ups are blocked. Please allow them in browser settings.');
        return;
      }

      setTimeout(() => {
        win.document.write(`
          <html>
            <head>
              <title>Add Service</title>
              <style>
                body{font-family:sans-serif;padding:20px;}
                label{display:block;margin-top:10px;font-weight:600;}
                input,textarea{width:100%;padding:6px;margin-top:4px;}
                button{margin-top:12px;padding:8px 14px;cursor:pointer;}
              </style>
            </head>
            <body>
              <h2>Add Service</h2>
              <form id="form">
                <label>Name</label><input id="serviceName" required>
                <label>Price</label><input id="price" type="number" required>
                <label>Period (min)</label><input id="period" type="number" required>
                <label>Description</label><textarea id="description"></textarea>
                <label>Group ID</label><input id="groupServiceId" type="number">
                <button type="submit">Save</button>
              </form>
              <script>
                const f=document.getElementById('form');
                f.addEventListener('submit',e=>{
                  e.preventDefault();
                  const payload={
                    serviceName:document.getElementById('serviceName').value,
                    price:Number(document.getElementById('price').value),
                    period:Number(document.getElementById('period').value),
                    description:document.getElementById('description').value,
                    groupServiceId:Number(document.getElementById('groupServiceId').value)||null
                  };
                  window.opener.postMessage({type:'save-service',payload},'*');
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

  // ----------- EDIT -----------
  openEdit(s: ServiceModel) {
    console.log('openEdit called', s);

    this.zone.runOutsideAngular(() => {
      const win = window.open('', '_blank', 'width=640,height=520,menubar=no,toolbar=no');
      if (!win) {
        alert('Pop-ups are blocked. Please allow them in browser settings.');
        return;
      }

      setTimeout(() => {
        win.document.write(`
          <html>
            <head>
              <title>Edit Service</title>
              <style>
                body{font-family:sans-serif;padding:20px;}
                label{display:block;margin-top:10px;font-weight:600;}
                input,textarea{width:100%;padding:6px;margin-top:4px;}
                button{margin-top:12px;padding:8px 14px;cursor:pointer;}
              </style>
            </head>
            <body>
              <h2>Edit Service</h2>
              <form id="form">
                <label>Name</label><input id="serviceName" value="${s.serviceName || ''}" required>
                <label>Price</label><input id="price" type="number" value="${s.price || ''}" required>
                <label>Period (min)</label><input id="period" type="number" value="${s.period || ''}" required>
                <label>Description</label><textarea id="description">${s.description || ''}</textarea>
                <label>Group ID</label><input id="groupServiceId" type="number" value="${s.groupServiceId || ''}">
                <button type="submit">Save</button>
              </form>
              <script>
                const f=document.getElementById('form');
                f.addEventListener('submit',e=>{
                  e.preventDefault();
                  const payload={
                    id:${s.id || 'null'},
                    serviceName:document.getElementById('serviceName').value,
                    price:Number(document.getElementById('price').value),
                    period:Number(document.getElementById('period').value),
                    description:document.getElementById('description').value,
                    groupServiceId:Number(document.getElementById('groupServiceId').value)||null
                  };
                  window.opener.postMessage({type:'save-service',payload},'*');
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

  // ----------- MESSAGE HANDLER -----------
  onMessage = (e: MessageEvent) => {
    if (e.data?.type === 'save-service') {
      console.log('Received service from popup:', e.data.payload);
      this.api.saveService(e.data.payload).subscribe({
        next: () => this.refresh(),
        error: (err) => console.error('Error saving service:', err)
      });
    }
  };

  // ----------- DELETE -----------
  del(id: number) {
    if (!confirm('Delete service?')) return;
    this.api.deleteService(id).subscribe({
      next: () => this.refresh(),
      error: (err) => console.error('Error deleting service:', err)
    });
  }
}
