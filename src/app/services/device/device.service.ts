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
        this.http.get(`${this.root}/entity/${this.entityId}/null?limit=10&offset=${skip}`).pipe(map(({ response }: any) => response)).subscribe(value => {
            this.device$.next(value)
        });

        return this.device$.asObservable();
    }

    getAvailablesDevices() {
        this.http.get(`${this.root}/entity/${this.entityId}/null?available=true`).pipe(
            map(({ response }: any) => response)
        ).subscribe((res) => this.device$.next(res))

        return this.device$.asObservable();
    }

    // Metodo utilizado para obtener los datos de lista devices
    rowsDeviceTable(devices: Array<any>): { devinuid: number; deviimei: string; carrlice: string; check: boolean; }[] {
        const devicesTable: { devinuid: number; deviimei: string; carrlice: string; check: boolean; }[] = [];
      
        devices.forEach(device => {
          let carrdevi = 'Sin Asignar';
          if (device.carrdevi && device.carrdevi.carrier.carrlice) {
            carrdevi = device.carrdevi.carrier.carrlice;
          }
      
          devicesTable.push({
            devinuid: device.devinuid,
            deviimei: device.deviimei,
            carrlice: carrdevi,
            check: device.check,
          });
        });
        
        return devicesTable;
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

    public setHistoryLoc(deviceId: number, filterDataDv: any, locations: any) {
        if (locations && locations.length > 0) {
            
          const historyLocs = locations.map((location: any) => {
            return {
              delonuid: Number(location.delonuid),
              delolati: Number(location.delolati),
              delolong: Number(location.delolong),
              delodire: location.delodire,
              delobarri: location.delobarri,
              delospee: location.delospee,
              delotime: location.delotime,
              delofesi: location.delofesi,
              keytypenomb: location.keywords.keytypenomb, 
              keywfunc: location.keywords.keywfunc,
              keyiconame: location.keywords.keyiconame,
              keyicoroute: location.keywords.keyicoroute
            };
          });

          const dvStringId = deviceId.toString();
          this._map.drawRoute(dvStringId, filterDataDv, historyLocs);

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

    public getfoundAvaCommands() {
        return this.http.get<ExecuteParamDv>(`${this.root}/command/available`);
    }

    public executeParamDevice(executeParamDv: ExecuteParamDv) {
        return this.http.post<ExecuteParamDv>(`${this.root}/command`, executeParamDv);
    }
}