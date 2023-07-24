import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { environment } from 'src/environments/environment';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { ExecuteParamDv, IDeviceCreate, IDeviceResponse } from './device.interface';
import { MapService } from '../map/map.service';

@Injectable({ providedIn: 'root' })
export class DeviceService {
    private root: string = `${environment.apiUrl}/device`;
    private device$: BehaviorSubject<any> = new BehaviorSubject([]);
    private historyLoc$: BehaviorSubject<any> = new BehaviorSubject([]);
    private entityId: string = JSON.parse(localStorage.getItem('entity') as string).entinuid;

    constructor(
        private http: HttpClient,
        private _map: MapService
    ) {}

    getDevice(skip: number = 0) {
        this.http.get(`${this.root}/entity/${this.entityId}?limit=10&offset=${skip}`).pipe(map(({ response }: any) => response)).subscribe(value => {
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
            tap(({ response }: any) => {
                this.addItem(response) 
            })
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

    public setHistoryLoc(deviceId: number, locations: any) {
        if (locations && locations.length > 0 && locations[0].deviloca) {
          const historyLocs = locations[0].deviloca.map((location: any) => {
            return {
              delonuid: Number(location.delonuid),
              delolati: Number(location.delolati),
              delolong: Number(location.delolong),
              delodire: location.delodire,
              delospee: location.delospee,
              delotime: location.delotime,
              delofesi: location.delofesi
            };
          });

          const dvStringId = deviceId.toString();
          this._map.drawRoute(dvStringId, historyLocs);

          this.historyLoc$.next({deviceId, historyLocs});
        }
    }
    
    public getHistoryLoc() {
        return this.historyLoc$.asObservable();
    }

    public clearHistoryLoc() {
        this.historyLoc$.next([]);
    }
    
    public validHistoryLoc() {
        const dataHLoc: any = this.historyLoc$.getValue();

        if (typeof(dataHLoc?.historyLocs) !== undefined) {
            if (dataHLoc?.historyLocs?.length) return true;
        }
        return false;
    }

    public executeParamDevice(executeParamDv: ExecuteParamDv) {
        return this.http.post<ExecuteParamDv>(`${this.root}/command`, executeParamDv);
    }
}