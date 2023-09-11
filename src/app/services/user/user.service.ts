import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, map, Observable, tap } from "rxjs";
import { environment } from '../../../environments/environment';
import { ICreateUser } from './user.interfaces';

@Injectable({ providedIn: 'root' })
export class UserService {
    private root: string = `${environment.apiUrl}/user`;
    permissions!: Array<string>
    private entityId: string = localStorage.getItem('entity') ? JSON.parse(localStorage.getItem('entity') as string).entinuid : null;
    private tokenData: string = localStorage.getItem('token') ? JSON.parse(JSON.stringify(localStorage.getItem('token'))):null;
    public userSysId: number=-1;
    private users$: BehaviorSubject<any> = new BehaviorSubject([]);

    constructor(private http: HttpClient) { 
        const tokenParts = this.tokenData.split('.');
        const payload = JSON.parse(atob(tokenParts[1]));
        this.userSysId = payload.usernuid;
    }

    createUser(user: ICreateUser): Observable<any> {
        return this.http.post(`${this.root}/entity/${this.entityId}`, user).pipe(
            map(({ response }: any) => this.addItem(response)),
        )
    }

    getPrivilsByEntityAll() {
        return this.http.get(`${this.root}/privilegies/?privilegies=true&entityId=${this.entityId}`);
    }

    getPrivilegiesByEntity(entityId: number) {
        return this.http.get(`${this.root}?privilegies=true&entityId=${entityId}`);
    }

    getPrivilegiesByUser(userId: number) {
        return this.http.get(`${this.root}?privilegies=true&entityId=${this.entityId}&userId=${userId}`);
    }

    getUsers() {
        this.http.get(`${this.root}?entityId=${this.entityId}`).pipe(
            map(({ response }: any) => response),
            tap(response => this.users$.next({ count: response.length, rows: response }))
        ).subscribe()

        return this.users$.asObservable()
    }

    editUser(user: any, id: string) {
        return this.http.patch(`${this.root}/${id}/entity/${this.entityId}`, user).pipe(
            map(({ response }: any) => this.updatedItem(response))
        )
    }

    deleteUser(userId: string) {
        return this.http.delete(`${this.root}/${userId}/entity/${this.entityId}`).pipe(
            map((response: any) => response.ok && this.deleteItem(userId))
        )
    }

    createEntity(entity: any) {
        return this.http.post(`${this.root}/entity/${this.entityId}`, entity)
    }

    getPermission(privilegies: Array<any>) {
        this.permissions = [...privilegies];
    }

    private addItem(value: any) {
        let list = this.users$.value;

        let newList = { ...list, rows: [value, ...list.rows] }

        this.users$.next(newList);
    }

    private updatedItem(value: any) {
        let list = this.users$.value;

        let item = list.rows.findIndex(({ usernuid }: any) => usernuid == value.usernuid);

        list.rows[item] = value;

        this.users$.next({ ...list });
    }

    private deleteItem(id: string) {
        let list = this.users$.value;
        let newList = list.rows.filter(({ usernuid }: any) => usernuid !== id);

        this.users$.next({ ...list, rows: newList });
    }
}