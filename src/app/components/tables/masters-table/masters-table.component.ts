import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { AdminService } from '../../../services/admin.service';
import { Master } from '../../../models/master.model';
import { GroupService } from '../../../models/group-service.model';

@Component({
  standalone: true,
  selector: 'app-masters-table',
  imports: [CommonModule],
  styleUrls: ['./masters-table.component.scss'],
  template: `
    <div class="card" style="margin-bottom:12px;">
      <button class="btn primary" (click)="openAdd()">Add Master</button>
      <button class="btn" (click)="refresh()">Refresh</button>
    </div>

    <div class="card">
      <table class="table">
        <thead>
          <tr>
            <th>#</th>
            <th>First Name</th>
            <th>Surname</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Group</th>
            <th style="width:150px;">Actions</th>
          </tr>
        </thead>

        <tbody>
          @for (m of rows; track m.id) {
            <tr>
              <td>{{ rows.indexOf(m) + 1 }}</td>
              <td>{{ m.firstName }}</td>
              <td>{{ m.surname }}</td>
              <td>{{ (m as any).phone || '-' }}</td>
              <td>{{ m.email || '-' }}</td>
              <td>{{ groupsMap[m.groupServiceId!] || '-' }}</td>

              <td>
                <button class="btn small" (click)="openEdit(m)">Edit</button>
                <button class="btn small danger" (click)="del(m.id)">Delete</button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `
})
export class MastersTableComponent implements OnInit {
  rows: Master[] = [];
  groups: GroupService[] = [];

  /** Map: groupId → name */
  groupsMap: Record<number, string> = {};

  constructor(
    private api: AdminService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadGroups();
    this.refresh();
  }

  /** ---- LOAD GROUPS ---- */
  loadGroups() {
    this.api.getGroups().subscribe({
      next: (g) => {
        this.groups = g;
        this.groupsMap = Object.fromEntries(
          g.map(x => [x.id, x.name])
        );
      },
      error: (err) => console.error('Failed to load groups:', err)
    });
  }

  /** ---- LOAD MASTERS ---- */
  refresh() {
    this.api.getMasters().subscribe({
      next: (data) => (this.rows = data),
      error: (err) => console.error('Failed to load masters:', err)
    });
  }

  /** ---- ROUTING ---- */
  openAdd() {
    this.router.navigate(['/edit/master', 'new']);
  }

  openEdit(m: Master) {
    this.router.navigate(['/edit/master', m.id]);
  }

  del(id: number) {
    if (!confirm('Delete master?')) return;

    this.api.deleteMaster(id).subscribe({
      next: () => this.refresh(),
      error: (err) => console.error('Error deleting master:', err)
    });
  }
}
