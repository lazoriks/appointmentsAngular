import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { AdminService } from '../../../services/admin.service';
import { ServiceModel } from '../../../models/service.model';
import { GroupService } from '../../../models/group-service.model';

interface GroupedServices {
  groupId: number | null;
  groupName: string;
  services: ServiceModel[];
  collapsed: boolean;
}

@Component({
  standalone: true,
  selector: 'app-services-table',
  imports: [CommonModule],
  styleUrls: ['./services-table.component.scss'],
  template: `
    <div class="card" style="margin-bottom:12px;">
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
        <button class="btn primary" (click)="openAdd()">Add Service</button>
        <button class="btn" (click)="refresh()">Refresh</button>
        <button class="btn info" (click)="toggleAll()">
          {{ allCollapsed ? 'Expand All' : 'Collapse All' }}
        </button>
      </div>
    </div>

    <div class="card" *ngIf="groupedRows.length">
      <div *ngFor="let group of groupedRows">
        <!-- Group Header -->
        <div class="group-header" (click)="toggleGroup(group)">
          📁 <b>{{ group.groupName }}</b>
          <span class="services-count">({{ group.services.length }} services)</span>
          <span class="arrow">{{ group.collapsed ? '▶' : '▼' }}</span>
        </div>

        <!-- Services Table -->
        <table class="table" *ngIf="!group.collapsed">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Price</th>
              <th>Period</th>
              <th>Description</th>
              <th style="width:150px;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let s of group.services; let i = index">
              <td>{{ i + 1 }}</td>
              <td>{{ s.serviceName }}</td>
              <td>{{ s.price }} €</td>
              <td>{{ s.period }} min</td>
              <td>{{ s.description || '-' }}</td>
              <td>
                <button class="btn small" (click)="openEdit(s)">Edit</button>
                <button class="btn small danger" (click)="del(s.id)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div *ngIf="!groupedRows.length" style="padding:16px;">
      No services found
    </div>
  `
})
export class ServicesTableComponent implements OnInit {
  rows: ServiceModel[] = [];
  groups: GroupService[] = [];
  groupsMap: Record<number, string> = {};
  groupedRows: GroupedServices[] = [];
  allCollapsed = false;

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
      next: data => {
        this.rows = data;
        this.groupServices();
      },
      error: err => console.error('Failed to load services:', err)
    });
  }

  /** GROUP SERVICES BY GROUP */
  groupServices() {
    const groupsMap: Map<number | null, GroupedServices> = new Map();

    // Initialize with all groups (including "No Group")
    this.groups.forEach(group => {
      groupsMap.set(group.id, {
        groupId: group.id,
        groupName: group.name,
        services: [],
        collapsed: this.allCollapsed
      });
    });

    // Add "No Group" category
    groupsMap.set(null, {
      groupId: null,
      groupName: 'No Group',
      services: [],
      collapsed: this.allCollapsed
    });

    // Distribute services to groups
    this.rows.forEach(service => {
      const groupId = service.groupServiceId || null;
      if (!groupsMap.has(groupId)) {
        // If group not found in groups list, create temporary entry
        const groupName = this.groupsMap[service.groupServiceId!] || 'Unknown Group';
        groupsMap.set(groupId, {
          groupId,
          groupName,
          services: [],
          collapsed: this.allCollapsed
        });
      }
      groupsMap.get(groupId)!.services.push(service);
    });

    // Convert to array and filter out empty groups if needed
    this.groupedRows = Array.from(groupsMap.values())
      .filter(group => group.services.length > 0)
      .sort((a, b) => {
        // "No Group" always at the end
        if (a.groupId === null) return 1;
        if (b.groupId === null) return -1;
        // Sort by group name
        return a.groupName.localeCompare(b.groupName);
      });

    // Sort services within each group by name
    this.groupedRows.forEach(group => {
      group.services.sort((a, b) => a.serviceName.localeCompare(b.serviceName));
    });
  }

  /** TOGGLE METHODS */
  toggleGroup(group: GroupedServices) {
    group.collapsed = !group.collapsed;
  }

  toggleAll() {
    this.allCollapsed = !this.allCollapsed;
    this.groupedRows.forEach(group => {
      group.collapsed = this.allCollapsed;
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