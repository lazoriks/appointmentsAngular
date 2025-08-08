import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Appointment } from '../models/appointment.model';
import { Client } from '../models/client.model';
import { Master } from '../models/master.model';
import { ServiceModel } from '../models/service.model';
import { Observable } from 'rxjs';

const BASE = 'https://appointmentspring-206160864813.us-central1.run.app/api/admin';

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(private http: HttpClient) {}

  // appointments
  getAppointments(from?: string, to?: string): Observable<Appointment[]> {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    return this.http.get<Appointment[]>(`${BASE}/appointments`, { params });
  }

  // services
  getServices(): Observable<ServiceModel[]> {
    return this.http.get<ServiceModel[]>(`${BASE}/services`);
  }
  saveService(svc: ServiceModel): Observable<ServiceModel> {
    return this.http.post<ServiceModel>(`${BASE}/services`, svc);
  }
  deleteService(id: number) {
    return this.http.delete(`${BASE}/services/${id}`);
  }

  // masters
  getMasters(): Observable<Master[]> {
    return this.http.get<Master[]>(`${BASE}/masters`);
  }
  saveMaster(m: Master): Observable<Master> {
    return this.http.post<Master>(`${BASE}/masters`, m);
  }
  deleteMaster(id: number) {
    return this.http.delete(`${BASE}/masters/${id}`);
  }

  // clients
  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(`${BASE}/clients`);
  }
  deleteClient(id: number) {
    return this.http.delete(`${BASE}/clients/${id}`);
  }
}
