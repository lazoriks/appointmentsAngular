import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { AdminService } from '../../../services/admin.service';
import { GroupService } from '../../../models/group-service.model';

@Component({
  standalone: true,
  selector: 'app-groups-table',
  imports: [CommonModule],
  styles: [],
  template: `
    <div class="card" style="margin-bottom:12px;">
      <button class="btn primary" (click)="openAdd()">Add Group</button>
      <button class="btn" (click)="refresh()">Refresh</button>
    </div>

    <div class="card">
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Group Name</th>
            <th>Description</th>
            <th style="width:150px;">Actions</th>
          </tr>
        </thead>

        <tbody>
          @for (g of rows; track g.id) {
            <tr>
              <td>{{ g.id }}</td>
              <td>{{ g.name }}</td>
              <td>{{ g.description || '-' }}</td>

              <td>
                <button class="btn small" (click)="openEdit(g)">Edit</button>
                <button class="btn small danger" (click)="del(g.id)">Delete</button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `
})
export class GroupsTableComponent implements OnInit {
  rows: GroupService[] = [];

  constructor(
    private api: AdminService,
    private router: Router
  ) {}

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.api.getGroups().subscribe({
      next: (d) => (this.rows = d),
      error: (err) => console.error('Failed to load groups:', err)
    });
  }

  openAdd() {
    this.router.navigate(['/edit/group', 'new']);
  }

  openEdit(g: GroupService) {
    this.router.navigate(['/edit/group', g.id]);
  }

  del(id: number) {
    if (!confirm('Delete group?')) return;

    this.api.deleteGroup(id).subscribe({
      next: () => this.refresh(),
      error: (err) => console.error('Error deleting group:', err)
    });
  }
}