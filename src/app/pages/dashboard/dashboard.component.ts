import { Component, signal, computed } from '@angular/core';
import { AppointmentsTableComponent } from '../../components/tables/appointments-table/appointments-table.component';
import { ClientsTableComponent } from '../../components/tables/clients-table/clients-table.component';
import { MastersTableComponent } from '../../components/tables/masters-table/masters-table.component';
import { ServicesTableComponent } from '../../components/tables/services-table/services-table.component';
import { GroupsTableComponent } from '../../components/tables/groups-table/groups-table.component';
import { CommonModule } from '@angular/common';

type TabKey = 'appointments' | 'clients' | 'masters' | 'services' | 'groups';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    AppointmentsTableComponent,
    ClientsTableComponent,
    MastersTableComponent,
    ServicesTableComponent,
    GroupsTableComponent
  ],
  template: `
    <div class="card">
      <div class="tabs">
        <div class="tab" [class.active]="tab() === 'appointments'" (click)="setTab('appointments')">Appointments</div>
        <div class="tab" [class.active]="tab() === 'clients'" (click)="setTab('clients')">Clients</div>
        <div class="tab" [class.active]="tab() === 'masters'" (click)="setTab('masters')">Masters</div>
        <div class="tab" [class.active]="tab() === 'services'" (click)="setTab('services')">Services</div>
        <div class="tab" [class.active]="tab() === 'groups'"   (click)="setTab('groups')">Groups</div>
      </div>

      <ng-container [ngSwitch]="tab()">
        <app-appointments-table *ngSwitchCase="'appointments'"></app-appointments-table>
        <app-clients-table *ngSwitchCase="'clients'"></app-clients-table>
        <app-masters-table *ngSwitchCase="'masters'"></app-masters-table>
        <app-services-table *ngSwitchCase="'services'"></app-services-table>
        <app-groups-table *ngSwitchCase="'groups'"></app-groups-table>
      </ng-container>
    </div>
  `
})
export class DashboardComponent {
  private _tab = signal<TabKey>('appointments');
  tab = computed(() => this._tab());
  setTab(t: TabKey) { this._tab.set(t); }
}
