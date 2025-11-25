import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { canActivateAuth } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },

  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [canActivateAuth]
  },

  // ------------------------
  // EDIT PAGES (standalone)
  // ------------------------
  {
    path: 'edit/master/:id',
    canActivate: [canActivateAuth],
    loadComponent: () =>
      import('./pages/edit/master-edit/master-edit.component')
        .then(m => m.MasterEditComponent)
  },
  {
    path: 'edit/service/:id',
    canActivate: [canActivateAuth],
    loadComponent: () =>
      import('./pages/edit/service-edit/service-edit.component')
        .then(m => m.ServiceEditComponent)
  },
  {
    path: 'edit/client/:id',
    canActivate: [canActivateAuth],
    loadComponent: () =>
      import('./pages/edit/client-edit/client-edit.component')
        .then(m => m.ClientEditComponent)
  },
  {
    path: 'edit/appointment/:id',
    canActivate: [canActivateAuth],
    loadComponent: () =>
      import('./pages/edit/appointment-edit/appointment-edit.component')
        .then(m => m.AppointmentEditComponent)
  },
  {
    path: 'edit/group/:id',
    canActivate: [canActivateAuth],
    loadComponent: () =>
      import('./pages/edit/group-edit/group-edit.component')
        .then(m => m.GroupEditComponent)
  },

  // ------------------------

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];
