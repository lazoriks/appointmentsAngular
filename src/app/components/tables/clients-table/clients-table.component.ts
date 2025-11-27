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
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
        <button class="btn primary" (click)="openAdd()">Add Client</button>
        <button class="btn" (click)="refresh()">Refresh</button>
        <button class="btn info" (click)="toggleSort()">
          Sort: {{ sortAscending ? 'A-Z' : 'Z-A' }}
        </button>
      </div>
    </div>

    <div class="card">
      <table class="table">
        <thead>
          <tr>
            <th>#</th>
            <th (click)="toggleSort()" style="cursor:pointer;">
              First Name 
              <span *ngIf="sortAscending">↑</span>
              <span *ngIf="!sortAscending">↓</span>
            </th>
            <th>Surname</th>
            <th>Mobile</th>
            <th>Email</th>
            <th>Date Created</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          @for (c of sortedRows; track c.id; let i = $index) {
            <tr>
              <td>{{ i + 1 }}</td>
              <td>{{ c.firstName }}</td>
              <td>{{ c.surname || '-' }}</td>
              <td>
                <a [href]="'tel:' + c.mobile" class="link">{{ c.mobile }}</a>
              </td>
              <td>
                <a *ngIf="c.email" [href]="'mailto:' + c.email" class="link">{{ c.email }}</a>
                <span *ngIf="!c.email">-</span>
              </td>
              <td>
                <span [title]="c.date_created | date:'medium'">
                  {{ c.date_created | date:'dd.MM.yyyy' }}
                </span>
              </td>
              <td>
                <button class="btn small" (click)="openEdit(c)">Edit</button>
                <button class="btn small danger" (click)="del(c.id)">Delete</button>
              </td>
            </tr>
          }
          @empty {
            <tr>
              <td colspan="7" style="text-align:center;padding:20px;">
                No clients found
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
  sortedRows: Client[] = [];
  sortAscending = true;

  constructor(
    private api: AdminService,
    private router: Router
  ) {}

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.api.getClients().subscribe({
      next: (data) => {
        this.rows = data;
        this.applySort();
      },
      error: (err) => console.error('Failed to load clients:', err)
    });
  }

  applySort() {
    this.sortedRows = [...this.rows].sort((a, b) => {
      const nameA = a.firstName?.toLowerCase() || '';
      const nameB = b.firstName?.toLowerCase() || '';
      
      if (nameA < nameB) return this.sortAscending ? -1 : 1;
      if (nameA > nameB) return this.sortAscending ? 1 : -1;
      return 0;
    });
  }

  toggleSort() {
    this.sortAscending = !this.sortAscending;
    this.applySort();
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