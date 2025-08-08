import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { Appointment } from '../../../models/appointment.model';

@Component({
  standalone: true,
  selector: 'app-appointments-table',
  imports: [NgFor, FormsModule],
  styleUrls: ['./appointments-table.component.scss'],
  template: `
    <div style="display:flex;gap:12px;align-items:center;margin-bottom:12px;">
      <div>
        <label>From</label>
        <input class="input" type="date" [(ngModel)]="fromDate" (change)="load()" />
      </div>
      <div>
        <label>To</label>
        <input class="input" type="date" [(ngModel)]="toDate" (change)="load()" />
      </div>
      <button class="btn" (click)="load()">Filter</button>
    </div>

    <div class="card">
      <table class="table">
        <thead>
          <tr>
            <th>#</th><th>Date/Time</th><th>Client</th><th>Master</th><th>Sum</th><th>Services</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let a of rows; index as i">
            <td>{{i+1}}</td>
            <td>{{a.datatime}}</td>
            <td>{{a.client?.firstName}} {{a.client?.surname}}</td>
            <td>{{a.master?.firstName}} {{a.master?.surname}}</td>
            <td>{{a.summ || '-'}}</td>
            <td>
              <ng-container *ngFor="let s of a.services; let last = last">
                {{s.serviceName}} ({{s.price}}) <span *ngIf="!last">, </span>
              </ng-container>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class AppointmentsTableComponent {
  rows: Appointment[] = [];
  fromDate = new Date().toISOString().split('T')[0];
  toDate = new Date().toISOString().split('T')[0];

  constructor(private api: AdminService) { this.load(); }

  load() {
    this.api.getAppointments(this.fromDate, this.toDate).subscribe({
      next: (data) => this.rows = data,
      error: (e) => console.error(e)
    });
  }
}
