import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Appointment } from '../models/appointment.model';
import { Client } from '../models/client.model';
import { Master } from '../models/master.model';
import { ServiceModel } from '../models/service.model';
import { GroupService } from '../models/group-service.model';
import { Holiday } from '../models/holiday.model';

const BASE = 'https://appointmentspring-206160864813.us-central1.run.app/api/admin';
const HOLIDAYS_BASE = 'https://appointmentspring-206160864813.us-central1.run.app/api/holidays';

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(private http: HttpClient) {}

  // -------------------------
  // APPOINTMENTS
  // -------------------------
  getAppointments(from?: string, to?: string): Observable<Appointment[]> {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    return this.http.get<Appointment[]>(`${BASE}/appointments`, { params });
  }

  getAppointment(id: number) {
    return this.http.get<Appointment>(`${BASE}/appointments/${id}`);
  }

  saveAppointment(app: Appointment): Observable<Appointment> {
    return this.http.post<Appointment>(`${BASE}/appointments`, app);
  }

  deleteAppointment(id: number) {
    return this.http.delete(`${BASE}/appointments/${id}`);
  }

  // В AdminService додайте цей метод:
  updateAppointment(app: Appointment): Observable<Appointment> {
    return this.http.put<Appointment>(`${BASE}/appointments/${app.id}`, app);
  }

  // -------------------------
  // SERVICES
  // -------------------------
  getServices(): Observable<ServiceModel[]> {
    return this.http.get<ServiceModel[]>(`${BASE}/services`);
  }

  getService(id: number): Observable<ServiceModel> {
    return this.http.get<ServiceModel>(`${BASE}/services/${id}`);
  }

  saveService(svc: ServiceModel): Observable<ServiceModel> {
    return this.http.post<ServiceModel>(`${BASE}/services`, svc);
  }

  deleteService(id: number) {
    return this.http.delete(`${BASE}/services/${id}`);
  }

  // -------------------------
  // MASTERS
  // -------------------------
  getMasters(): Observable<Master[]> {
    return this.http.get<Master[]>(`${BASE}/masters`);
  }

  getMaster(id: number): Observable<Master> {
    return this.http.get<Master>(`${BASE}/masters/${id}`);
  }

  saveMaster(m: Master): Observable<Master> {
    return this.http.post<Master>(`${BASE}/masters`, m);
  }

  deleteMaster(id: number) {
    return this.http.delete(`${BASE}/masters/${id}`);
  }

  // -------------------------
  // MASTER SERVICES (Many-to-Many)
  // -------------------------
  getMasterServices(masterId: number): Observable<ServiceModel[]> {
    return this.http.get<ServiceModel[]>(`${BASE}/masters/${masterId}/services`);
  }

  updateMasterServices(masterId: number, serviceIds: number[]): Observable<any> {
    return this.http.post(`${BASE}/masters/${masterId}/services`, serviceIds);
  }

  // -------------------------
  // CLIENTS
  // -------------------------
  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(`${BASE}/clients`);
  }

  getClient(id: number): Observable<Client> {
    return this.http.get<Client>(`${BASE}/clients/${id}`);
  }

  saveClient(c: Client): Observable<Client> {
    return this.http.post<Client>(`${BASE}/clients`, c);
  }

  deleteClient(id: number) {
    return this.http.delete(`${BASE}/clients/${id}`);
  }

  getAppointmentsByClient(clientId: number) {
  return this.http.get<Appointment[]>(`${BASE}/clients/${clientId}/appointments`);
  }

  // -------------------------
  // GROUPS
  // -------------------------
  getGroups(): Observable<GroupService[]> {
    return this.http.get<GroupService[]>(`${BASE}/groups`);
  }

  getGroup(id: number): Observable<GroupService> {
    return this.http.get<GroupService>(`${BASE}/groups/${id}`);
  }

  saveGroup(g: GroupService) {
    return this.http.post<GroupService>(`${BASE}/groups`, g);
  }

  deleteGroup(id: number) {
    return this.http.delete(`${BASE}/groups/${id}`);
  }

  // -------------------------
  // HOLIDAYS
  // -------------------------
  getHolidaysByMaster(masterId: number): Observable<Holiday[]> {
    return this.http.get<Holiday[]>(`${HOLIDAYS_BASE}/master/${masterId}`);
  }

  createHoliday(masterId: number, startDate: string, finishDate: string) {
    return this.http.post<Holiday>(HOLIDAYS_BASE, {
      masterId,
      startDate,
      finishDate
    });
  }

  deleteHoliday(id: number) {
    return this.http.delete(`${HOLIDAYS_BASE}/${id}`);
  }
}
