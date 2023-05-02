import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ResetComponent } from './reset-password/reset-password.component';

import { TokenGuards } from './guards/token.guard'
const routes: Routes = [
  { path: '', component: LoginComponent, data: { animation: 'login' } },
  { path: 'reset', component: ResetComponent, data: { animation: 'login' } },
  { path: 'register', loadComponent: () => import('./register/register.component').then(m => m.RegisterComponent) },
  { path: 'sended', loadComponent: () => import('./register-sended/register-sended.component').then(m => m.RegisterSendedComponent) },
  { path: 'app', canActivate: [TokenGuards], loadChildren: () => import('./layout/layout.module').then(m => m.LayoutModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
