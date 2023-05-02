import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from '../../../environments/environment';
import { IUserLogIn } from './auth.interfaces';


@Injectable({ providedIn: 'root' })
export class AuthService {
    private root: string = `${environment.apiUrl}/auth`;
    constructor(private http: HttpClient) { }

    logIn(user: IUserLogIn): Observable<any> {
        return this.http.post<any>(`${this.root}/login`, user);
    }
}

export interface Response {
    status: boolean,
    data: {
        accessToken: string,
        fullname: string,
        role: string,
        username: string
    }
}