import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { environment } from 'src/environments/environment';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { IDeviceCreate, IDeviceResponse } from './device.interface';

@Injectable({ providedIn: 'root' })
export class DeviceService {
    private root: string = `${environment.apiUrl}/device`;
    private device$: BehaviorSubject<any> = new BehaviorSubject([]);
    private entityId: string = JSON.parse(localStorage.getItem('entity') as string).entinuid;

    constructor(private http: HttpClient) { }

    getDevice(skip: number = 0) {
        this.http.get(`${this.root}/entity/${this.entityId}?limit=10&offset=${skip}`).pipe(map(({ response }: any) => response)).subscribe(value => {
            console.log(value)
            this.device$.next(value)
        });

        return this.device$.asObservable();
    }
    getAvailablesDevices() {
        this.http.get(`${this.root}/entity/${this.entityId}?available=true`).pipe(
            map(({ response }: any) => response)
        ).subscribe((res) => this.device$.next(res))

        return this.device$.asObservable();
    }
    createDevice(device: IDeviceCreate): Observable<IDeviceResponse> {
        return this.http.post<IDeviceResponse>(`${this.root}/entity/${this.entityId}`, device).pipe(
            tap(({ response }: any) => this.addItem(response))
        )
    }

    updateDevice(device: IDeviceCreate, deviceId: string) {
        return this.http.patch(`${this.root}/${deviceId}`, device).pipe(
            tap(console.log),
            map((response: any) => response.ok && this.updatedItem(response.response))
        )
    }

    deleteDevice(deviceId: string) {
        return this.http.delete(`${this.root}/${deviceId}`).pipe(
            map((response: any) => response.ok && this.deleteItem(deviceId))
        )
    }

    unlinkDevice(deviceId: string) {
        return this.http.delete(`${this.root}/unlink/${deviceId}`);
    }

    private updatedItem(value: any) {
        let list = this.device$.value;

        let item = list.rows.findIndex(({ devinuid }: any) => devinuid == value.devinuid);
        console.log(item)
        list.rows[item] = value;

        this.device$.next({ ...list });
    }

    private addItem(value: any) {
        let list = this.device$.value;

        let newList = { ...list, rows: [value, ...list.rows] }

        this.device$.next(newList);
    }
    private deleteItem(id: string) {
        let list = this.device$.value;
        let newList = list.rows.filter(({ devinuid }: any) => devinuid !== id);

        this.device$.next({ ...list, rows: newList });
    }
}