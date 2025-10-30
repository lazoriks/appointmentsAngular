import { Component, OnInit, OnDestroy } from '@angular/core';
import { AdminService } from '../../../services/admin.service';

@Component({
  standalone: true,
  selector: 'app-masters-table',
  imports: [],
  styleUrls: ['./masters-table.component.scss'],
  template: `
    <div class="card" style="margin-bottom:12px;">
      <button class="btn primary" (click)="openAdd()">Add Master</button>
      <button class="btn" (click)="refresh()">Refresh</button>
    </div>

    <div class="card">
      <table class="table">
        <thead>
          <tr><th>#</th><th>First Name</th><th>Surname</th><th>Phone</th><th>Email</th><th>Actions</th></tr>
        </thead>
        <tbody>
          @for (m of rows; track m.id) {
            <tr>
              <td>{{ rows.indexOf(m) + 1 }}</td>
              <td>{{ m.firstName }}</td>
              <td>{{ m.surname }}</td>
              <td>{{ m.phone || '-' }}</td>
              <td>{{ m.email || '-' }}</td>
              <td>
                <button class="btn" (click)="openEdit(m)">Edit</button>
                <button class="btn danger" (click)="del(m.id)">Delete</button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `
})
export class MastersTableComponent implements OnInit, OnDestroy {
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
    this.api.getMasters().subscribe({ next: d => this.rows = d });
  }

  openAdd() { this.openFormWindow('Add Master', {}); }
  openEdit(m: any) { this.openFormWindow('Edit Master', m); }

  openFormWindow(title: string, data: any) {
    const win = window.open('', '_blank', 'width=600,height=480');
    if (!win) return;

    win.document.write(`
      <html><head><title>${title}</title>
      <style>body{font-family:sans-serif;padding:20px;}label{display:block;margin-top:10px;}</style></head>
      <body>
      <h2>${title}</h2>
      <form id="form">
        <label>First Name</label><input id="firstName" value="${data.firstName || ''}" required>
        <label>Surname</label><input id="surname" value="${data.surname || ''}" required>
        <label>Phone</label><input id="phone" value="${data.phone || ''}">
        <label>Email</label><input id="email" value="${data.email || ''}">
        <button type="submit">Save</button>
      </form>
      <script>
        const f=document.getElementById('form');
        f.addEventListener('submit',e=>{
          e.preventDefault();
          const payload={
            id:${data.id||'null'},
            firstName:document.getElementById('firstName').value,
            surname:document.getElementById('surname').value,
            phone:document.getElementById('phone').value,
            email:document.getElementById('email').value
          };
          window.opener.postMessage({type:'save-master',payload},'*');
          window.close();
        });
      </script>
      </body></html>
    `);
    win.document.close();
  }

  onMessage = (e: MessageEvent) => {
    if (e.data?.type === 'save-master') {
      this.api.saveMaster(e.data.payload).subscribe({ next: () => this.refresh() });
    }
  }

  del(id: number) {
    if (!confirm('Delete master?')) return;
    this.api.deleteMaster(id).subscribe({ next: () => this.refresh() });
  }
}
