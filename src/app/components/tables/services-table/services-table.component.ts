import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { AdminService } from '../../../services/admin.service';
import { ServiceModel } from '../../../models/service.model';
import { GroupService } from '../../../models/group-service.model';

@Component({
  standalone: true,
  selector: 'app-services-table',
  imports: [CommonModule],
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
            <th>Group</th>
            <th style="width:150px;">Actions</th>
          </tr>
        </thead>

        <tbody>
          @for (s of rows; track s.id) {
            <tr>
              <td>{{ rows.indexOf(s) + 1 }}</td>
              <td>{{ s.serviceName }}</td>
              <td>{{ s.price }}</td>
              <td>{{ s.period }} min</td>
              <td>{{ s.description || '-' }}</td>
              <td>{{ groupsMap[s.groupServiceId!] || '-' }}</td>

              <td>
                <button class="btn small" (click)="openEdit(s)">Edit</button>
                <button class="btn small danger" (click)="del(s.id)">Delete</button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `
})
export class ServicesTableComponent implements OnInit {
  rows: ServiceModel[] = [];
  groups: GroupService[] = [];
  groupsMap: Record<number, string> = {};

  constructor(
    private api: AdminService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadGroups();
    this.refresh();
  }

  /** GROUPS */
  loadGroups() {
    this.api.getGroups().subscribe({
      next: (g) => {
        this.groups = g;
        this.groupsMap = Object.fromEntries(
          g.map(gr => [gr.id, gr.name])
        );
      },
      error: err => console.error('Failed to load groups:', err)
    });
  }

  /** SERVICES */
  refresh() {
    this.api.getServices().subscribe({
      next: d => (this.rows = d),
      error: err => console.error('Failed to load services:', err)
    });
  }

  openAdd() {
    this.router.navigate(['/edit/service', 'new']);
  }

  openEdit(s: ServiceModel) {
    this.router.navigate(['/edit/service', s.id]);
  }

  del(id: number) {
    if (!confirm('Delete service?')) return;

    this.api.deleteService(id).subscribe({
      next: () => this.refresh(),
      error: err => console.error('Error deleting service:', err)
    });
  }
}
