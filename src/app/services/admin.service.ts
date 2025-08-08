import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Appointment } from '../models/appointment.model';
import { Service } from '../models/service.model';
import { Master } from '../models/master.model';
import { Client } from '../models/client.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminService {
  // 🔧 Change if you host backend elsewhere
  private base = 'https://appointmentspring-206160864813.us-central1.run.app/api/admin';

  constructor(private http: HttpClient) {}

  // Appointments
  getAppointments(from?: string, to?: string): Observable<Appointment[]> {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    return this.http.get<Appointment[]>(`${this.base}/appointments`, { params });
  }

  // Services
  getServices(): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.base}/services`);
  }
  saveService(payload: Service): Observable<Service> {
    return this.http.post<Service>(`${this.base}/services`, payload);
  }
  deleteService(id: number) {
    return this.http.delete(`${this.base}/services/${id}`);
  }

  // Masters
  getMasters(): Observable<Master[]> {
    return this.http.get<Master[]>(`${this.base}/masters`);
  }
  saveMaster(payload: Master): Observable<Master> {
    return this.http.post<Master>(`${this.base}/masters`, payload);
  }
  deleteMaster(id: number) {
    return this.http.delete(`${this.base}/masters/${id}`);
  }

  // Clients
  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.base}/clients`);
  }
  saveClient(payload: Client): Observable<Client> {
    return this.http.post<Client>(`${this.base}/clients`, payload);
  }
  deleteClient(id: number) {
    return this.http.delete(`${this.base}/clients/${id}`);
  }
}
