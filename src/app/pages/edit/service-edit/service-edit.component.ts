import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AdminService } from '../../../services/admin.service';
import { ServiceModel } from '../../../models/service.model';
import { GroupService } from '../../../models/group-service.model';

@Component({
  standalone: true,
  selector: 'app-service-edit',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card" *ngIf="service">

      <h2>{{ isNew ? 'Add Service' : 'Edit Service' }}</h2>

      <label>Name</label>
      <input [(ngModel)]="service.serviceName" />

      <label>Price (€)</label>
      <input type="number" [(ngModel)]="service.price" />

      <label>Period (minutes)</label>
      <input type="number" [(ngModel)]="service.period" />

      <label>Description</label>
      <textarea [(ngModel)]="service.description"></textarea>

      <label>Group</label>
      <select [(ngModel)]="service.groupServiceId">
        <option value="">-- Select Group --</option>
        <option *ngFor="let g of groups" [value]="g.id">
          {{ g.name }}
        </option>
      </select>

      <button class="btn primary" (click)="save()">Save</button>
    </div>
  `,
  styles: [`
    .card { padding: 16px; max-width: 700px; margin: 16px auto; }
    label { display:block; margin-top:8px; font-weight:600; }
    input, textarea, select {
      width:100%; padding:6px; margin-top:2px; box-sizing:border-box;
    }
    textarea { min-height: 80px; }
    .btn { padding:8px 14px; cursor:pointer; margin-top:16px; border-radius:4px; }
    .btn.primary { background:#1976d2; color:white; }
  `]
})
export class ServiceEditComponent implements OnInit {

  service!: ServiceModel;
  groups: GroupService[] = [];
  isNew = false;
  serviceId!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: AdminService
  ) {}

  ngOnInit() {

    const id = this.route.snapshot.paramMap.get('id');
    this.isNew = id === 'new';

    // Load groups
    this.api.getGroups().subscribe(g => this.groups = g);

    // New service
    if (this.isNew) {
      this.service = {
        id: 0,
        serviceName: '',
        price: 0,
        period: 30,
        description: '',
        groupServiceId: undefined
      };
      return;
    }

    // Existing service
    this.serviceId = Number(id);

    this.api.getService(this.serviceId).subscribe(s => {
      this.service = s;
    });
  }

  save() {
    this.api.saveService(this.service).subscribe(() => {
      this.router.navigate(['/dashboard']);
    });
  }
}
