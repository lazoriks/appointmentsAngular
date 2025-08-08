import { Component } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { Appointment } from '../../../models/appointment.model';

@Component({
  selector: 'app-appointments-table',
  templateUrl: './appointments-table.component.html',
  styleUrls: ['./appointments-table.component.scss'],
})
export class AppointmentsTableComponent {
  rows: Appointment[] = [];
  loading = false;

  // date filters (default today)
  from = new Date().toISOString().split('T')[0];
  to = new Date().toISOString().split('T')[0];

  // modal
  modalVisible = false;
  modalModel: any = {};
  modalFields = [
    { key: 'datatime', label: 'Datetime (local)', type: 'datetime-local' },
    { key: 'clientFirstName', label: 'Client First Name' },
    { key: 'clientSurname', label: 'Client Surname' },
    { key: 'clientMobile', label: 'Client Mobile' },
    { key: 'clientEmail', label: 'Client Email', type: 'email' },
    { key: 'masterId', label: 'Master ID', type: 'number' },
    { key: 'serviceId', label: 'Main Service ID', type: 'number' },
  ];
  // NOTE: For full “create appointment” we usually hit /api/appointments (not /admin),
  // but leaving modal mainly for “view/edit prototype”. You can wire a dedicated admin-create endpoint if needed.

  constructor(private api: AdminService) {
    this.fetch();
  }

  fetch() {
    this.loading = true;
    this.api.getAppointments(this.from, this.to).subscribe({
      next: (data) => { this.rows = data; this.loading = false; },
      error: () => { this.rows = []; this.loading = false; }
    });
  }

  openAdd() {
    const nowLocal = new Date().toISOString().slice(0,16);
    this.modalModel = {
      datatime: nowLocal, clientFirstName: '', clientSurname: '',
      clientMobile: '', clientEmail: '', masterId: '', serviceId: ''
    };
    this.modalVisible = true;
  }

  openEdit(row: Appointment) {
    const dt = row.datatime?.slice(0,16) ?? new Date().toISOString().slice(0,16);
    this.modalModel = {
      datatime: dt,
      clientFirstName: row.client?.firstName || '',
      clientSurname: row.client?.surname || '',
      clientMobile: row.client?.mobile || '',
      clientEmail: row.client?.email || '',
      masterId: row.master?.id || '',
      serviceId: row.service?.id || '',
    };
    this.modalVisible = true;
  }

  save(model: any) {
    // This example only closes modal and refetches.
    // For real edit/create implement PUT/POST endpoints on /api/admin/appointments
    this.modalVisible = false;
    this.fetch();
  }

  delete(row: Appointment) {
    // Implement /api/admin/appointments/{id} DELETE if you want actual deletions.
    alert('Delete endpoint not implemented for appointments in /api/admin. Add it if needed.');
  }
}
