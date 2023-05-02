import { Injectable } from '@angular/core';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { DashboardAdminComponent } from '../dashboard-admin/dashboard-admin.component';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DashboardGuard implements CanActivate {
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
        let role = localStorage.getItem('role') as string;
        if (['SUP-ROOT'].includes(role)) {
            //@ts-ignore
            route.routeConfig.component = DashboardComponent;
        }  else {
           //@ts-ignore
           route.routeConfig.component = DashboardAdminComponent; 
        }
        return true
    }
}