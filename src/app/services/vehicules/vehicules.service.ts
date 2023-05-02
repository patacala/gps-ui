import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { environment } from 'src/environments/environment';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class VehiculeService {
    private root: string = `${environment.apiUrl}/carrier`;
    private vehicule$: BehaviorSubject<any> = new BehaviorSubject([]);
    private entityId: string = !!localStorage.getItem('entity') ? JSON.parse(localStorage.getItem('entity') as string).entinuid : null
    constructor(private http: HttpClient) { }

    getVehicules() {
        this.http.get(`${this.root}/entity/${this.entityId}`).pipe(
            map(({ response }: any) => response)
        ).subscribe((res) => this.vehicule$.next(res))

        return this.vehicule$.asObservable();
    }

    postVehicule(vehicule: any): Observable<any> {
        return this.http.post(`${this.root}/entity/${this.entityId}`, vehicule).pipe(
            map(({ response }: any) => this.addItem(response))
        )
    }

    updateVehicule(vehicule: any, vehiculeId: string) {
        return this.http.patch(`${this.root}/${vehiculeId}`, vehicule).pipe(
            map(({ response }: any) => this.updatedItem(response))
        )
    }

    deleteVehicule(vehiculeId: string) {
        return this.http.delete(`${this.root}/${vehiculeId}`).pipe(
            tap((response: any) => response.ok && this.deleteItem(vehiculeId))
        )
    }

    private addItem(value: any) {
        let list = this.vehicule$.value;
        let newList = { ...list, rows: [value, ...list.rows] }

        this.vehicule$.next(newList);
    }

    private updatedItem(value: any) {
        let list = this.vehicule$.value;

        let item = list.rows.findIndex(({ carrnuid }: any) => carrnuid == value.carrnuid);

        list.rows[item] = value;

        this.vehicule$.next({ ...list });
    }

    private deleteItem(id: string) {
        let list = this.vehicule$.value;
        let newList = list.rows.filter(({ carrnuid }: any) => carrnuid !== id);

        this.vehicule$.next({ ...list, rows: newList });
    }
}