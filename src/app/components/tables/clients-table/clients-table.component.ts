import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { AdminService } from '../../../services/admin.service';
import { Client } from '../../../models/client.model';

@Component({
  standalone: true,
  selector: 'app-clients-table',
  imports: [CommonModule],
  styleUrls: ['./clients-table.component.scss'],
  template: `
    <div class="card" style="margin-bottom:12px;">
      <button class="btn primary" (click)="openAdd()">Add Client</button>
      <button class="btn" (click)="refresh()">Refresh</button>
    </div>

    <div class="card">
      <table class="table">
        <thead>
          <tr>
            <th>#</th>
            <th>First Name</th>
            <th>Surname</th>
            <th>Mobile</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          @for (c of rows; track c.id) {
            <tr>
              <td>{{ rows.indexOf(c) + 1 }}</td>
              <td>{{ c.firstName }}</td>
              <td>{{ c.surname || '-' }}</td>
              <td>{{ c.mobile }}</td>
              <td>{{ c.email || '-' }}</td>

              <td>
                <button class="btn small" (click)="openEdit(c)">Edit</button>
                <button class="btn small danger" (click)="del(c.id)">Delete</button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `
})
export class ClientsTableComponent implements OnInit {
  rows: Client[] = [];

  constructor(
    private api: AdminService,
    private router: Router
  ) {}

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.api.getClients().subscribe({
      next: (d) => (this.rows = d),
      error: (err) => console.error('Failed to load clients:', err)
    });
  }

  openAdd() {
    this.router.navigate(['/edit/client', 'new']);
  }

  openEdit(c: Client) {
    this.router.navigate(['/edit/client', c.id]);
  }

  del(id: number) {
    if (!confirm('Delete client?')) return;

    this.api.deleteClient(id).subscribe({
      next: () => this.refresh(),
      error: (err) => console.error('Error deleting client:', err)
    });
  }
}
