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

      <label>First Name</label>
      <input [(ngModel)]="client.firstName" />

      <label>Surname</label>
      <input [(ngModel)]="client.surname" />

      <label>Mobile</label>
      <input [(ngModel)]="client.mobile" />

      <label>Email</label>
      <input [(ngModel)]="client.email" />

      <label>Google ID</label>
      <input [(ngModel)]="client.googleId" />

      <button class="btn primary" (click)="save()">Save</button>
    </div>

    <!-- Appointments -->
    <div class="card" *ngIf="!isNew">
      <h3>Appointments of this client</h3>

      <table class="table" *ngIf="appointments.length">
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Master</th>
            <th>Services</th>
            <th>Sum</th>
            <th style="width:150px;">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let a of appointments">
            <td>{{ a.datatime | date:'yyyy-MM-dd' }}</td>
            <td>{{ a.datatime | date:'HH:mm' }}</td>
            <td>{{ a.master?.firstName }} {{ a.master?.surname }}</td>
            <td>{{ servicesToString(a) }}</td>
            <td>{{ a.summ }}</td>
            <td>
              <button class="btn small" (click)="editAppointment(a.id)">Edit</button>
              <button class="btn small danger" (click)="deleteAppointment(a.id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div *ngIf="!appointments.length">
        No appointments for this client.
      </div>
    </div>
  `,
  styles: [`
    .card { padding: 16px; max-width: 900px; margin: 16px auto; }
    label { display:block; margin-top:8px; font-weight:600; }
    input, textarea { width:100%; padding:6px; margin-top:2px; }
    .btn { padding:6px 12px; border-radius:4px; cursor:pointer; margin-top:12px; }
    .btn.primary { background:#1976d2; color:white; }
    .btn.small { padding:4px 8px; font-size:13px; margin-right:4px; }
    .btn.danger { background:#e53935; color:white; }
    table.table { width:100%; border-collapse:collapse; margin-top:12px; }
    table.table th, table.table td { padding:8px; border-bottom:1px solid #eee; }
    table.table th { background:#f7f7f7; font-weight:600; }
  `]
})
export class ClientEditComponent implements OnInit {
  client!: Client;
  appointments: Appointment[] = [];
  clientId!: number;
  isNew = false;

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
        googleId: ''
      };
      return;
    }

    this.clientId = Number(id);

    // Load client
    this.api.getClient(this.clientId).subscribe(c => (this.client = c));

    // Load appointments
    this.api.getAppointmentsByClient(this.clientId).subscribe(a => {
      this.appointments = a;
    });
  }

  save() {
    const saveCall = this.isNew
      ? this.api.saveClient(this.client)
      : this.api.saveClient(this.client);

    saveCall.subscribe(() => {
      this.router.navigate(['/dashboard']);
    });
  }

  editAppointment(id: number) {
    this.router.navigate(['/edit/appointment', id]);
  }

  deleteAppointment(id: number) {
    if (!confirm('Delete appointment?')) return;

    this.api.deleteAppointment(id).subscribe(() => {
      this.appointments = this.appointments.filter(a => a.id !== id);
    });
  }

  servicesToString(a: Appointment) {
    if (a.services?.length) {
      return a.services.map(s => s.serviceName).join(', ');
    }
    return a.service?.serviceName || '-';
  }
}
