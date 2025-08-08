import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Pages
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component'; // Corrected import path

// Shared Components
import { NavbarComponent } from './components/navbar/navbar.component';
import { ModalFormComponent } from './components/modal-form/modal-form.component'; // Corrected import path

// Tables
import { AppointmentsTableComponent } from './components/tables/appointments-table/appointments-table.component';
import { ClientsTableComponent } from './components/tables/clients-table/clients-table.component'; // Corrected import path
import { MastersTableComponent } from './components/tables/masters-table/masters-table.component';
import { ServicesTableComponent } from './components/tables/services-table/services-table.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    NavbarComponent,
    ModalFormComponent,
    AppointmentsTableComponent,
    ClientsTableComponent,
    MastersTableComponent,
    ServicesTableComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
