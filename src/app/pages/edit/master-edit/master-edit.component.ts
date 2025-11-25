import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AdminService } from '../../../services/admin.service';

import { Master } from '../../../models/master.model';
import { GroupService } from '../../../models/group-service.model';
import { ServiceModel } from '../../../models/service.model';
import { Holiday } from '../../../models/holiday.model';

@Component({
  standalone: true,
  selector: 'app-master-edit',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card" *ngIf="master">

      <h2>{{ isNew ? 'Add Master' : 'Edit Master' }}</h2>

      <!-- BASIC INFO -->
      <label>First Name</label>
      <input [(ngModel)]="master.firstName"/>

      <label>Surname</label>
      <input [(ngModel)]="master.surname"/>

      <label>Email</label>
      <input [(ngModel)]="master.email"/>

      <label>Phone</label>
      <input [(ngModel)]="master.phone"/>

      <!-- GROUP -->
      <label>Group</label>
      <select [(ngModel)]="master.groupServiceId">
        <option value="">-- Select Group --</option>
        <option *ngFor="let g of groups" [value]="g.id">{{ g.name }}</option>
      </select>

      <!-- SERVICES -->
      <label>Services</label>
      <div class="service-list">
        <label *ngFor="let s of services" class="svc-row">
          <input 
            type="checkbox"
            [checked]="isSelectedService(s.id)"
            (change)="toggleService(s.id)"
          />
          {{ s.serviceName }} (€{{ s.price }})
        </label>
      </div>

      <!-- HOLIDAYS -->
      <h3 style="margin-top:30px;">Holidays</h3>

      <table class="table small">
        <thead>
          <tr>
            <th>#</th>
            <th>Start</th>
            <th>Finish</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let h of holidays; let i=index">
            <td>{{ i+1 }}</td>
            <td>{{ h.startDate }}</td>
            <td>{{ h.finishDate }}</td>
            <td>
              <button class="btn small danger" (click)="deleteHoliday(h.id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- ADD NEW HOLIDAY -->
      <div class="holiday-add">
        <h4>Add Holiday</h4>
        
        <label>Start Date</label>
        <input type="date" [(ngModel)]="newHolidayStart">

        <label>Finish Date</label>
        <input type="date" [(ngModel)]="newHolidayFinish">

        <button class="btn small" (click)="addHoliday()">Add Holiday</button>
      </div>

      <button class="btn primary" (click)="save()">Save</button>
    </div>
  `,
  styles: [`
    .card { padding:16px; max-width:800px; margin:20px auto; }
    label { display:block; margin-top:10px; font-weight:600; }
    input, select { width:100%; padding:6px; margin-top:4px; }
    .service-list { border:1px solid #ccc; padding:10px; border-radius:8px; max-height:300px; overflow-y:auto; margin-top:6px; }
    .svc-row { display:flex; align-items:center; gap:8px; margin-bottom:6px; }
    .table { width:100%; margin-top:12px; border-collapse:collapse; }
    .table th { background:#f5f5f5; padding:6px; border-bottom:1px solid #ddd; }
    .table td { padding:6px; border-bottom:1px solid #eee; }
    .btn { padding:6px 12px; border-radius:4px; margin-top:16px; cursor:pointer; }
    .btn.primary { background:#1976d2; color:white; }
    .btn.small { padding:4px 8px; font-size:13px; }
    .btn.danger { background:#d32f2f; color:white; }
    h3 { margin-top:24px; }
    .holiday-add { border:1px solid #ddd; padding:12px; border-radius:8px; margin-top:20px; }
  `]
})
export class MasterEditComponent implements OnInit {

  master!: Master;
  isNew = false;

  groups: GroupService[] = [];
  services: ServiceModel[] = [];

  holidays: Holiday[] = [];

  newHolidayStart = '';
  newHolidayFinish = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: AdminService
  ) {}

  ngOnInit() {

    const idParam = this.route.snapshot.paramMap.get('id');
    this.isNew = idParam === 'new';

    // Load dropdowns
    this.api.getGroups().subscribe(g => this.groups = g);
    this.api.getServices().subscribe(s => this.services = s);

    // If new master
    if (this.isNew) {
      this.master = {
        id: 0,
        firstName: '',
        surname: '',
        email: '',
        phone: '',
        groupServiceId: undefined,
        serviceIds: []
      };
      this.holidays = [];
      return;
    }

    // Load existing master
    const id = Number(idParam);

    this.api.getMaster(id).subscribe(m => {
      this.master = {
        ...m,
        serviceIds: m.services ? m.services.map(x => x.id) : []
      };
    });

    // Load holidays
    this.api.getHolidaysByMaster(id).subscribe(h => this.holidays = h);
  }


  /** SERVICES MULTISELECT */
  isSelectedService(serviceId: number): boolean {
    return this.master.serviceIds?.includes(serviceId) ?? false;
  }

  toggleService(serviceId: number) {
    if (!this.master.serviceIds) this.master.serviceIds = [];

    if (this.master.serviceIds.includes(serviceId)) {
      this.master.serviceIds = this.master.serviceIds.filter(x => x !== serviceId);
    } else {
      this.master.serviceIds.push(serviceId);
    }
  }

  /** HOLIDAYS */
  addHoliday() {
    if (!this.newHolidayStart || !this.newHolidayFinish) {
      alert('Select both dates');
      return;
    }

    this.api.createHoliday(
      this.master.id,
      this.newHolidayStart,
      this.newHolidayFinish
    ).subscribe(h => {
      this.holidays.push(h);
      this.newHolidayStart = '';
      this.newHolidayFinish = '';
    });
  }

  deleteHoliday(id: number) {
    if (!confirm('Delete holiday?')) return;

    this.api.deleteHoliday(id).subscribe(() => {
      this.holidays = this.holidays.filter(h => h.id !== id);
    });
  }

  save() {
    this.api.saveMaster(this.master).subscribe(() => {
      this.router.navigate(['/dashboard']);
    });
  }
}
