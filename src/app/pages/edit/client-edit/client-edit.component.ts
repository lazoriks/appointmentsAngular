import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AdminService } from '../../../services/admin.service';
import { Client } from '../../../models/client.model';
import { Appointment } from '../../../models/appointment.model';

@Component({
  standalone: true,
  selector: 'app-client-edit',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card" *ngIf="client">
      <h2>{{ isNew ? 'Add Client' : 'Edit Client' }}</h2>

      <label>First Name *</label>
      <input [(ngModel)]="client.firstName" required />

      <label>Surname</label>
      <input [(ngModel)]="client.surname" />

      <label>Mobile *</label>
      <input [(ngModel)]="client.mobile" required />

      <label>Email</label>
      <input [(ngModel)]="client.email" type="email" />

      <label>Google ID</label>
      <input [(ngModel)]="client.googleId" />

      <!-- Date Created (readonly for existing clients) -->
      <div *ngIf="!isNew && client.date_created">
        <label>Date Created</label>
        <input [value]="client.date_created | date:'yyyy-MM-dd HH:mm'" readonly />
      </div>

      <div class="button-group">
        <button class="btn primary" (click)="save()">Save</button>
        <button class="btn" (click)="cancel()">Cancel</button>
      </div>
    </div>

    <!-- Appointments -->
    <div class="card" *ngIf="!isNew && client.id">
      <h3>Appointments of this client</h3>

      <table class="table" *ngIf="appointments.length">
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Master</th>
            <th>Services</th>
            <th>Sum</th>
            <th>Created</th>
            <th style="width:150px;">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let a of appointments">
            <td>{{ a.datatime | date:'yyyy-MM-dd' }}</td>
            <td>{{ a.datatime | date:'HH:mm' }}</td>
            <td>{{ a.master?.firstName }} {{ a.master?.surname }}</td>
            <td>{{ servicesToString(a) }}</td>
            <td>{{ a.summ | number:'1.2-2' }} €</td>
            <td>{{ a.date_created | date:'dd.MM.yy HH:mm' }}</td>
            <td>
              <button class="btn small" (click)="editAppointment(a.id)">Edit</button>
              <button class="btn small danger" (click)="deleteAppointment(a.id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div *ngIf="!appointments.length" style="text-align: center; padding: 20px;">
        No appointments for this client.
      </div>
    </div>
  `,
  styles: [`
    .card { padding: 16px; max-width: 900px; margin: 16px auto; }
    label { display:block; margin-top:12px; font-weight:600; }
    input, textarea { width:100%; padding:8px; margin-top:4px; box-sizing:border-box; border:1px solid #ccc; border-radius:4px; }
    input[readonly] { background-color: #f5f5f5; color: #666; }
    .btn { padding:8px 16px; border-radius:4px; cursor:pointer; border:none; }
    .btn.primary { background:#1976d2; color:white; }
    .btn.small { padding:4px 8px; font-size:13px; margin-right:4px; }
    .btn.danger { background:#e53935; color:white; }
    .button-group { display:flex; gap:8px; margin-top:16px; }
    table.table { width:100%; border-collapse:collapse; margin-top:12px; }
    table.table th, table.table td { padding:8px; border-bottom:1px solid #eee; text-align:left; }
    table.table th { background:#f7f7f7; font-weight:600; }
    table.table tr:hover { background:#f5f5f5; }
  `]
})
export class ClientEditComponent implements OnInit {
  client!: Client;
  appointments: Appointment[] = [];
  clientId!: number;
  isNew = false;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: AdminService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.isNew = id === 'new';

    if (this.isNew) {
      this.client = {
        id: 0,
        firstName: '',
        surname: '',
        mobile: '',
        email: '',
        googleId: '',
        date_created: new Date().toISOString() // Додаємо поточну дату для нового клієнта
      };
      this.loading = false;
      return;
    }

    this.clientId = Number(id);
    if (isNaN(this.clientId)) {
      console.error('Invalid client ID:', id);
      this.loading = false;
      return;
    }

    // Load client
    this.api.getClient(this.clientId).subscribe({
      next: (c) => {
        this.client = c;
        this.loading = false;
        
        // Load appointments only after client is loaded
        this.loadAppointments();
      },
      error: (err) => {
        console.error('Failed to load client:', err);
        this.loading = false;
      }
    });
  }

  loadAppointments() {
    this.api.getAppointmentsByClient(this.clientId).subscribe({
      next: (a) => {
        this.appointments = a;
      },
      error: (err) => {
        console.error('Failed to load appointments:', err);
      }
    });
  }

  save() {
    // Validation
    if (!this.client.firstName?.trim()) {
      alert('First Name is required');
      return;
    }
    
    if (!this.client.mobile?.trim()) {
      alert('Mobile is required');
      return;
    }

    // For new clients, set current date
    if (this.isNew) {
      this.client.date_created = new Date().toISOString();
    }

    const saveCall = this.isNew
      ? this.api.saveClient(this.client)
      : this.api.saveClient(this.client);

    saveCall.subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Error saving client:', err);
        alert('Error saving client');
      }
    });
  }

  cancel() {
    this.router.navigate(['/dashboard']);
  }

  editAppointment(id: number) {
    this.router.navigate(['/edit/appointment', id]);
  }

  deleteAppointment(id: number) {
    if (!confirm('Delete appointment?')) return;

    this.api.deleteAppointment(id).subscribe({
      next: () => {
        this.appointments = this.appointments.filter(a => a.id !== id);
      },
      error: (err) => {
        console.error('Error deleting appointment:', err);
        alert('Error deleting appointment');
      }
    });
  }

  servicesToString(a: Appointment): string {
    if (a.services?.length) {
      return a.services.map(s => s.serviceName).join(', ');
    }
    return a.service?.serviceName || '-';
  }
}