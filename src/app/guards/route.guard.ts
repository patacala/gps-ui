import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class RoutesGuards implements CanActivate {
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
        const role = localStorage.getItem('role') as string;
        const sAdmin = ['dashboard', 'entidades', 'vehiculos'];
        const pAdmin = ['dashboard', 'users', 'vehiculos', 'gps'];

        if(['SUP-ROOT'].includes(role) && sAdmin.includes(route.routeConfig?.path as string)) {
            return true
        }
        if(['ADMIN-PRI'].includes(role) && pAdmin.includes(route.routeConfig?.path as string)) {
            return true
        }
        return false;
    }
}