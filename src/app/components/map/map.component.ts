import { AfterViewChecked, Component, OnInit, ViewChild } from '@angular/core';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { TreeComponent } from '../tree-classifiers/tree.component';
import { ClassifierService, MapService } from '@services';
import { from, interval, mergeMap, Observable, pipe, Subject, Subscription } from 'rxjs';
import { concatAll, concatMap, filter, finalize, map, switchMap, takeUntil, tap, toArray } from 'rxjs/operators';
import { AsyncPipe, NgIf } from '@angular/common';
import { ButtonComponent } from '../button/button.component';
@Component({
    selector: 'app-map',
    standalone: true,
    imports: [MatSidenavModule, TreeComponent, NgIf, AsyncPipe, ButtonComponent],
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, AfterViewChecked {
    @ViewChild('detailsVehicule') details!: MatDrawer;
    showFiller = false;
    devices!: Array<any>;
    deviceSelected$: Subject<any> = new Subject()
    classifiers!: any
    imitationRealTime$ = interval(20000).pipe(
        concatMap(v => this._map.getLocationDevices()),
        mergeMap((devices: any) => from(devices.response.rows)),
        this.getDevicesLocation(false),
        toArray(),
        tap(devices => this.devices = devices),
    );
    subscriptions: Subscription[] = [];
    constructor(private _map: MapService, private _classifier: ClassifierService) { }

    ngOnInit(): void {
        setTimeout(() => {
            this._map.drawMap('map');
            let locationSub$ = this._map.getLocationDevices().pipe(
                mergeMap((devices: any) => from(devices.response.rows)),
                this.getDevicesLocation(false),
                toArray(),
                tap(devices => this.devices = devices),
            ).subscribe();
            this.subscriptions.push(locationSub$)
        }, 1000);

        let clickSubs$ = this._map.getVehiculeObs().pipe(
            tap(console.log),
            map(id => this.devices.find(({ devinuid }) => devinuid == id)),
            tap((device) => this.deviceSelected$.next(device)),
            map((device) => {
                let posicion = device.deviloca.filter((p: any) => new Date(p.delofesi).toDateString() === new Date().toDateString());
                this._map.getLocationWithGap(posicion, device);
            }),
            tap(() => this.details.toggle()),
            concatMap(() => this.imitationRealTime$),
        ).subscribe()

        // this.subscriptions.push(clickSubs$)
    }

    ngAfterViewChecked(): void {
        this.details.closedStart.subscribe(() => {
            this.subscriptions.map(s => s.unsubscribe());
            this._map.resetMapToInitial()
        })
    }

    saveClassifiers(event: any) {
        this.classifiers = event
    }

    filterDevices() {
        this._classifier.filterByClassifier(this.classifiers).pipe(
            map((devices: any) => devices.response),
            this.getDevicesLocation(true)
        ).subscribe()
    }

    getDevicesLocation(isFilter: boolean) {
        let mapService = this._map;

        return function <T>(source: Observable<T>) {
            return source.pipe(
                !isFilter
                    ?
                    pipe(
                        filter((devices: any) => devices.deviloca.length > 0),
                        tap((device: any) => mapService.drawMarker({ lat: Number(device?.deviloca[0].delolati), lng: Number(device.deviloca[0].delolong), id: device.devinuid.toString() }))
                    )
                    :
                    (
                        tap((devices: any) => mapService.filterMarkers(devices))
                    )
            )
        }
    }
}