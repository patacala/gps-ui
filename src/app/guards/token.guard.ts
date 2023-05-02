import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { UserService } from '@services'
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators'
@Injectable({
    providedIn: 'root'
})
export class TokenGuards implements CanActivate {
    constructor(private _user: UserService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
        const isLogged = localStorage.getItem('token') as string;
        const id = !!localStorage.getItem('entity') ? JSON.parse(localStorage.getItem('entity') as string).entinuid : null;

        return !id ? true : this._user.getPrivilegiesByEntity(id).pipe(
            map(({ response }: any) => response),
            tap((result) => this._user.getPermission(result)),
            map((result: Array<any>) => result.length > 0 && !!isLogged)
        )
    }
}