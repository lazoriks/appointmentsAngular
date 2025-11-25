import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AdminService } from '../../../services/admin.service';
import { Appointment } from '../../../models/appointment.model';
import { Client } from '../../../models/client.model';
import { Master } from '../../../models/master.model';
import { ServiceModel } from '../../../models/service.model';

@Component({
  standalone: true,
  selector: 'app-appointment-edit',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card" *ngIf="appointment">
      <h2>{{ isNew ? 'Add Appointment' : 'Edit Appointment' }}</h2>

      <!-- DATETIME -->
      <label>Date & Time</label>
      <input type="datetime-local" [(ngModel)]="appointment.datatime" />

      <!-- CLIENT -->
      <label>Client</label>
      <select [(ngModel)]="appointment.client.id">
        <option value="">-- Select Client --</option>
        <option *ngFor="let c of clients" [value]="c.id">
          {{ c.firstName }} {{ c.surname }}
        </option>
      </select>

      <!-- MASTER -->
      <label>Master</label>
      <select [(ngModel)]="appointment.master.id">
        <option value="">-- Select Master --</option>
        <option *ngFor="let m of masters" [value]="m.id">
          {{ m.firstName }} {{ m.surname }}
        </option>
      </select>

      <!-- MULTI SERVICES -->
      <label>Services</label>
      <div class="service-list">
        <label *ngFor="let s of services" class="svc-row">
          <input 
            type="checkbox" 
            [checked]="isSelected(s.id)"
            (change)="toggleService(s)"
          />
          {{ s.serviceName }} (€{{ s.price }})
        </label>
      </div>

      <!-- SUMMARY -->
      <label>Total (€)</label>
      <input [(ngModel)]="appointment.summ" type="number" readonly />

      <button class="btn primary" (click)="save()">Save</button>
    </div>
  `,
  styles: [`
    .card { padding:16px; max-width:750px; margin:16px auto; }
    label { display:block; margin-top:10px; font-weight:600; }
    input, select, textarea { width:100%; padding:6px; margin-top:4px; box-sizing:border-box; }
    .service-list { margin-top:8px; border:1px solid #ccc; padding:10px; border-radius:8px; max-height:250px; overflow-y:auto; }
    .svc-row { display:flex; align-items:center; gap:8px; margin-bottom:6px; }
    .btn { padding:8px 14px; cursor:pointer; margin-top:16px; border-radius:4px; }
    .btn.primary { background:#1976d2; color:white; }
  `]
})
export class AppointmentEditComponent implements OnInit {

  appointment!: Appointment;
  clients: Client[] = [];
  masters: Master[] = [];
  services: ServiceModel[] = [];

  isNew = false;
  id!: number;

  constructor(
    private route: ActivatedRoute,
    private api: AdminService,
    private router: Router
  ) {}

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.isNew = idParam === 'new';

    // Load dropdown data
    this.api.getClients().subscribe(c => this.clients = c);
    this.api.getMasters().subscribe(m => this.masters = m);
    this.api.getServices().subscribe(s => this.services = s);

    if (this.isNew) {
      this.appointment = {
        id: 0,
        datatime: this.defaultDatetime(),
        client: { id: 0, firstName: '', mobile: '' },
        master: { id: 0, firstName: '', surname: '' },
        services: [],
        summ: 0
      };
      return;
    }

    this.id = Number(idParam);
    this.api.getAppointment(this.id).subscribe(a => {
      this.appointment = {
        ...a,
        datatime: new Date(a.datatime).toISOString().slice(0,16)
      };
    });
  }

  defaultDatetime(): string {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0,16);
  }

  /** MULTISELECT HELPERS */
  isSelected(serviceId: number): boolean {
    return this.appointment.services?.some(s => s.id === serviceId) ?? false;
  }

  toggleService(s: ServiceModel) {
    if (!this.appointment.services) {
      this.appointment.services = [];
    }

    if (this.isSelected(s.id)) {
      this.appointment.services = this.appointment.services.filter(x => x.id !== s.id);
    } else {
      this.appointment.services.push(s);
    }

    this.recalculateSum();
  }

  /** AUTO SUM */
  recalculateSum() {
    this.appointment.summ =
      this.appointment.services?.reduce((acc, s) => acc + s.price, 0) ?? 0;
  }

  save() {
    this.api.saveAppointment(this.appointment).subscribe(() => {
      this.router.navigate(['/dashboard']);
    });
  }
}
