import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { environment } from 'src/environments/environment';
import { Observable, BehaviorSubject } from 'rxjs';
import { ICompany, ICreateUser, IResponseCompany } from '@services';
import { map, tap } from 'rxjs/operators';
@Injectable({ providedIn: 'root' })
export class CompanyService {
    private root: string = `${environment.apiUrl}/entity`;
    private company$: BehaviorSubject<any> = new BehaviorSubject([]);
    constructor(private http: HttpClient) { }

    getCompany() {
        this.http.get(`${this.root}`).pipe(
            map(({ response }: any) => response),
            tap(value => this.company$.next(value)),
        ).subscribe()
        return this.company$.asObservable();
    }

    saveCompany(company: any): Observable<any> {
        return this.http.post(`${this.root}`, company).pipe(
            tap((value: any) => this.addItem(value?.response))
        )
    }

    updateCompany(id: string, body: ICreateUser): Observable<IResponseCompany> {
        return this.http.patch<IResponseCompany>(`${this.root}/${id}`, body).pipe(tap(value => this.updatedItem(value)))
    }

    deleteCompany(id: string): Observable<IResponseCompany> {
        return this.http.delete<IResponseCompany>(`${this.root}/${id}`).pipe(
            tap((value: any) => value.ok && this.deleteItem(id))
        )
    }

    private updatedItem({ response }: any) {
        let list: Array<any> = this.company$.value.rows

        let item = list.findIndex(({ entinuid }) => entinuid == response.entinuid);

        list[item] = response;

        this.company$.next([...list]);
    }

    private addItem(value: IResponseCompany) {
        let list = this.company$.value;
        let newList = { ...list, rows: [value, ...list.rows] };

        this.company$.next(newList);
    }

    private deleteItem(id: string) {
        let list = this.company$.value;
        let newList = list.rows.filter(({ entinuid }: any) => entinuid !== id);

        this.company$.next({ ...list, rows: newList });
    }
}