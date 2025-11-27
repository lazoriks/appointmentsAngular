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
    <div class="card" *ngIf="appointment; else loading">
      <h2>{{ isNew ? 'Add Appointment' : 'Edit Appointment' }}</h2>

      <!-- DATETIME -->
      <label>Date & Time</label>
      <input type="datetime-local" [(ngModel)]="appointment.datatime" />

      <!-- CLIENT -->
      <label>Client</label>
      <select [(ngModel)]="appointment.client.id">
        <option value="">-- Select Client --</option>
        <option *ngFor="let c of clients" [value]="c.id">
          {{ c.firstName }} {{ c.surname || '' }}
        </option>
      </select>

      <!-- MASTER -->
      <label>Master</label>
      <select [(ngModel)]="appointment.master.id">
        <option value="">-- Select Master --</option>
        <option *ngFor="let m of masters" [value]="m.id">
          {{ m.firstName }} {{ m.surname || '' }}
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

      <!-- TOTAL SUM -->
      <label>Total Sum (€)</label>
      <input [(ngModel)]="appointment.summ" type="number" step="0.01" min="0" readonly />

      <!-- DATE CREATED (Readonly for existing appointments) -->
      <div *ngIf="!isNew">
        <label>Date Created</label>
        <input [value]="appointment.date_created | date:'yyyy-MM-dd HH:mm'" readonly />
      </div>

      <div class="button-group">
        <button class="btn primary" (click)="save()">Save</button>
        <button class="btn" (click)="cancel()">Cancel</button>
      </div>
    </div>

    <ng-template #loading>
      <div class="card">
        <p>Loading...</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .card { padding:16px; max-width:750px; margin:16px auto; }
    label { display:block; margin-top:10px; font-weight:600; }
    input, select, textarea { width:100%; padding:6px; margin-top:4px; box-sizing:border-box; }
    .service-list { margin-top:8px; border:1px solid #ccc; padding:10px; border-radius:8px; max-height:250px; overflow-y:auto; }
    .svc-row { display:flex; align-items:center; gap:8px; margin-bottom:6px; }
    .btn { padding:8px 14px; cursor:pointer; margin-top:16px; border-radius:4px; margin-right:8px; }
    .btn.primary { background:#1976d2; color:white; }
    .button-group { display:flex; gap:8px; }
  `]
})
export class AppointmentEditComponent implements OnInit {

  appointment!: Appointment;
  clients: Client[] = [];
  masters: Master[] = [];
  services: ServiceModel[] = [];

  isNew = false;
  id!: number;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private api: AdminService,
    private router: Router
  ) {}

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.isNew = idParam === 'new';

    // Load dropdown data
    this.api.getClients().subscribe({
      next: c => this.clients = c,
      error: err => console.error('Failed to load clients:', err)
    });
    
    this.api.getMasters().subscribe({
      next: m => this.masters = m,
      error: err => console.error('Failed to load masters:', err)
    });
    
    this.api.getServices().subscribe({
      next: s => this.services = s,
      error: err => console.error('Failed to load services:', err)
    });

    if (this.isNew) {
      this.appointment = {
        id: 0,
        datatime: this.defaultDatetime(),
        client: { id: 0, firstName: '', mobile: '' },
        master: { id: 0, firstName: '', surname: '' },
        services: [],
        summ: 0,
        date_created: new Date().toISOString()
      };
      this.loading = false;
      return;
    }

    this.id = Number(idParam);
    if (isNaN(this.id)) {
      console.error('Invalid appointment ID:', idParam);
      this.loading = false;
      return;
    }

    this.api.getAppointment(this.id).subscribe({
      next: a => {
        console.log('Loaded appointment:', a);
        // Ensure services array exists
        if (!a.services && a.service) {
          a.services = [a.service];
        }
        this.appointment = {
          ...a,
          datatime: this.formatDateForInput(new Date(a.datatime))
        };
        this.loading = false;
      },
      error: err => {
        console.error('Failed to load appointment:', err);
        this.loading = false;
      }
    });
  }

  defaultDatetime(): string {
    const now = new Date();
    return this.formatDateForInput(now);
  }

  formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
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
    // Validate required fields
    if (!this.appointment.client.id || !this.appointment.master.id) {
      alert('Please select both client and master');
      return;
    }

    if (!this.appointment.services || this.appointment.services.length === 0) {
      alert('Please select at least one service');
      return;
    }

    // Prepare data for backend
    const appointmentToSave = {
      ...this.appointment,
      datatime: new Date(this.appointment.datatime).toISOString()
    };

    if (this.isNew) {
      this.api.saveAppointment(appointmentToSave).subscribe({
        next: () => {
          console.log('Appointment created successfully');
          this.router.navigate(['/dashboard']);
        },
        error: err => {
          console.error('Error creating appointment:', err);
          alert('Error creating appointment');
        }
      });
    } else {
      this.api.updateAppointment(appointmentToSave).subscribe({
        next: () => {
          console.log('Appointment updated successfully');
          this.router.navigate(['/dashboard']);
        },
        error: err => {
          console.error('Error updating appointment:', err);
          alert('Error updating appointment');
        }
      });
    }
  }

  cancel() {
    this.router.navigate(['/dashboard']);
  }
}