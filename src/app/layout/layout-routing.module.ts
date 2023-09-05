import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from './layout.component';

const routes: Routes = [
    {
        path: '', component: LayoutComponent, children: [
            { path: '', redirectTo: 'mapa', pathMatch: 'full', },
            // { path: 'dashboard', canActivate: [DashboardGuard], loadComponent: () => import('../dashboard/dashboard.component').then(m => m.DashboardComponent) },
            { path: 'mapa', canActivate: [], loadComponent: () => import('../dashboard-admin/dashboard-admin.component').then(m => m.DashboardAdminComponent) },
            { path: 'entidades', canActivate: [], loadComponent: () => import('../entitys/entitys.component').then(m => m.EntitysComponent) },
            { path: 'vehiculos', canActivate: [], loadComponent: () => import('../vehicules/vehicules.component').then(m => m.VehiculesComponent) },
            { path: 'users', canActivate: [], loadComponent: () => import('../users/users.component').then(m => m.UsersComponent) },
            { path: 'gps', canActivate: [], loadComponent: () => import('../gps/gps.component').then(m => m.GpsComponent) },
            { path: 'clasificadores', loadComponent: () => import('../classifiers/classifiers.component').then(m => m.ClassifiersComponent) },
            { path: 'clasificadores/:id', loadComponent: () => import('../details/details.component').then(m => m.DetailsComponent) }
        ]
    },
]


@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LayoutRoutingModule { }