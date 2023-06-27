import { AfterViewChecked, Component, OnInit, ViewChild } from '@angular/core';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { TreeComponent } from '../tree-classifiers/tree.component';
import { ClassifierService, MapService } from '@services';
import { from, interval, mergeMap, Observable, pipe, Subject, Subscription } from 'rxjs';
import { concatMap, filter, map, tap, toArray } from 'rxjs/operators';
import { AsyncPipe, DatePipe, JsonPipe, NgIf } from '@angular/common';
import { ButtonComponent } from '../button/button.component';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { InputComponent } from '../input/input.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatNativeDateModule, ThemePalette } from '@angular/material/core';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { Device, LocationData } from './map.model';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DataTimeHComponent } from '../data-time-h/data-time-h.component';
import { ItemDtDvComponent } from '../item-dt-dv/item-dt-dv.component';

@Component({
    selector: 'app-map',
    standalone: true,
    imports: [
        MatSidenavModule, MatCheckboxModule, 
        MatTableModule, TreeComponent, 
        InputComponent, NgIf, AsyncPipe, 
        ButtonComponent, MatFormFieldModule, 
        MatDatepickerModule, MatNativeDateModule,
        FormsModule, ReactiveFormsModule,
        JsonPipe, DatePipe, MatInputModule,
        MatIconModule, MatSlideToggleModule,
        MatDialogModule, ItemDtDvComponent
    ],
    providers: [DatePipe],
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, AfterViewChecked {
    displayedColumns: string[] = ['select', 'imei', 'plate'];
    
    devicesTable: Device[]=[];
    proFilterDevices: LocationData[] = [];
    dataSource = new MatTableDataSource<Device>([]);
    checksDevices = new SelectionModel<Device>(true, []);
    color: ThemePalette = 'accent';
    
    @ViewChild('detailsVehicule') details!: MatDrawer;
    showFiller = false;
    devices!: Array<any>;
    deviceSelected$: Subject<any> = new Subject();
    classifiers!: any;
    imitationRealTime$ = interval(20000).pipe(
        concatMap(v => this._map.getLocationDevices()),
        mergeMap((devices: any) => from(devices.response.rows)),
        this.getDevicesLocation(false),
        toArray(),
        tap(devices => this.devices = devices),
    );
    subscriptions: Subscription[] = [];
    formFilter = new FormGroup({
       /*  plate: new FormControl<String | null>(null), */
        startDateOnly: new FormControl<Date | null>(null, Validators.required),
        endDateOnly: new FormControl<Date | null>(null, Validators.required),
        withAlert: new FormControl<Boolean | false>(false)
    });
    
    constructor(
        private _map: MapService, 
        private _classifier: ClassifierService, 
        private _utilsService: UtilsService,
        public dialog: MatDialog,
        private datePipe: DatePipe
    ) {}

    ngOnInit(): void {
        setTimeout(() => {
            this._map.drawMap('map');
            let locationSub$ = this._map.getLocationDevices().pipe(
                mergeMap((devices: any) => from(devices.response.rows)),
                this.getDevicesLocation(false),
                toArray(),
                tap(devices => this.devices = devices),
            ).subscribe((devices) => {
                // Obtener información de los dispositivos
                this.devicesTable = this.rowsDeviceTable(devices);
                this.dataSource.data = this.devicesTable;
            });

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

    validDisabledArray(...arrays: Array<Array<any>>): boolean {
        for (const array of arrays) {
          if (typeof array === 'undefined' || array.length === 0) {
            return true;
          }
        }
        return false;
    }
      
    filterDevices() {
        const filterDataDvs = {
            classifiers: this.classifiers?.flat(),
            /* plate: this.formFilter.value.plate, */
            deviceIds: this.checksDevices.selected.map(device => device.devinuid),
            isAlarm: this.formFilter.value.withAlert,
            date: {
                startDate: this.formFilter.value.startDateOnly?.toISOString().slice(0, 10),
                endDate: this.formFilter.value.endDateOnly?.toISOString().slice(0, 10)
            }
        };

        this._classifier.filterByClassifier(filterDataDvs).pipe(
            map((devices: any) => devices.response),
            this.getDevicesLocation(true)
        ).subscribe((devices: any) => {
            this.proFilterDevices = this.processFilterData(devices);
        });
    }

    processFilterData(datas: any) {
        const newArray: LocationData[] = [];
        const mappedArray = datas.map((data:any) => ({
            deviimei: data.deviimei,
            devimark: data.devimark,
            devimode: data.devimode,
            deviphon: data.deviphon,
            carrlice: data.carrdevi.carrier.carrlice,
            carrtype: data.carrdevi.carrier.carrtype,
            locations: {
                delolati: data.deviloca.map((loc: any) => loc.delolati),
                delolong: data.deviloca.map((loc: any) => loc.delolong),
                delofesi: data.deviloca.map((loc: any) => loc.delofesi),
                delotime: data.deviloca.map((loc: any) => loc.delotime),
                delospee: data.deviloca.map((loc: any) => loc.delospee)
            }
        }));  

        mappedArray.forEach((row: any) => {
            const locations = row.locations;
            locations.delolati.forEach((lat: any, index: number) => {
                newArray.push({
                    IMEI: row.deviimei,
                    MARCA: row.devimark,
                    MODELO: row.devimode,
                    CELULAR: row.deviphon,
                    PLACA: row.carrlice,
                    "TIPO VEHICULO": row.carrtype,
                    LATITUD: lat,
                    LONGITUD: locations.delolong[index],
                    "FECHA SISTEMA": locations.delofesi[index],
                    "FECHA REGISTRO": locations.delotime[index],
                    VELOCIDAD: locations.delospee[index],
                })
            });
        });
        return newArray;  
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

    isAllSelected() {
        const numSelected = this.checksDevices.selected.length;
        const numRows = this.dataSource.data.length;
        return numSelected === numRows;
    }

    toggleAllRows() {
        if (this.isAllSelected()) {
          this.checksDevices.clear();
          return;
        }
    
        this.checksDevices.select(...this.dataSource.data);
    }

    checkboxLabel(row?: Device): string {
        if (!row) {
          return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
        }
        return `${this.checksDevices.isSelected(row) ? 'deselect' : 'select'} row ${row.devinuid + 1}`;
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    upperCase(event: any) {
        const input = event.target.value;
        const uppercase = input.toUpperCase();
        event.target.value = uppercase;
    }

    // Metodo utilizado para obtener los datos de lista devices
    rowsDeviceTable(devices: Array<any>): { devinuid: number; deviimei: string; carrlice: string; }[] {
        const devicesTable: { devinuid: number; deviimei: string; carrlice: string; }[] = [];
      
        devices.forEach(device => {
          let carrdevi = 'Sin Asignar';
          if (device.carrdevi && device.carrdevi.carrier.carrlice) {
            carrdevi = device.carrdevi.carrier.carrlice;
          }
      
          devicesTable.push({
            devinuid: device.devinuid,
            deviimei: device.deviimei,
            carrlice: carrdevi
          });
        });
        
        return devicesTable;
      }
      
    // Exportar .csv
    saveDataInCSV(name: string, data: Array<any>): void {
        let csvContent = this._utilsService.saveDataInCSV(data);
    
        var hiddenElement = document.createElement('a');
        hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvContent);
        hiddenElement.target = '_blank';
        hiddenElement.download = name + '.csv';
        hiddenElement.click();
    }

    openDialogHistory(deviceId: number) {
        const locations = [
            {
                "delofesi": "2023-06-26 15:57:38",
                "delonuid": 15324,
                "devidelo": 8,
                "delotinu": "2023-06-26",
                "delokeyw": "001",
                "delotime": "230626155738",
                "delosimc": "",
                "delosign": "F",
                "delohour": "205738.00",
                "delosigc": "A",
                "delolati": "10.950521",
                "delolaor": "N",
                "delolong": "-74.791963",
                "deloloor": "W",
                "delospee": "0",
                "delodat1": "",
                "delodat2": "8",
                "deloacc": "1",
                "delodoor": "0",
                "delodat3": null,
                "delodat4": null,
                "delodat5": null
            },
            {
                "delofesi": "2023-06-26 15:57:38",
                "delonuid": 15322,
                "devidelo": 8,
                "delotinu": "2023-06-26",
                "delokeyw": "001",
                "delotime": "230626155738",
                "delosimc": "",
                "delosign": "F",
                "delohour": "205738.00",
                "delosigc": "A",
                "delolati": "10.950521",
                "delolaor": "N",
                "delolong": "-74.791963",
                "deloloor": "W",
                "delospee": "0",
                "delodat1": "",
                "delodat2": "8",
                "deloacc": "1",
                "delodoor": "0",
                "delodat3": null,
                "delodat4": null,
                "delodat5": null
            },
            {
                "delofesi": "2023-06-26 15:57:38",
                "delonuid": 15323,
                "devidelo": 8,
                "delotinu": "2023-06-26",
                "delokeyw": "001",
                "delotime": "230626155738",
                "delosimc": "",
                "delosign": "F",
                "delohour": "205738.00",
                "delosigc": "A",
                "delolati": "10.950521",
                "delolaor": "N",
                "delolong": "-74.791963",
                "deloloor": "W",
                "delospee": "0",
                "delodat1": "",
                "delodat2": "8",
                "deloacc": "1",
                "delodoor": "0",
                "delodat3": null,
                "delodat4": null,
                "delodat5": null
            },
            {
                "delofesi": "2023-06-26 15:52:54",
                "delonuid": 15321,
                "devidelo": 8,
                "delotinu": "2023-06-26",
                "delokeyw": "acc off",
                "delotime": "230626155253",
                "delosimc": "",
                "delosign": "F",
                "delohour": "205253.00",
                "delosigc": "A",
                "delolati": "10.950521",
                "delolaor": "N",
                "delolong": "-74.792007",
                "deloloor": "W",
                "delospee": "0",
                "delodat1": "",
                "delodat2": "8",
                "deloacc": "1",
                "delodoor": "0",
                "delodat3": null,
                "delodat4": null,
                "delodat5": null
            },
            {
                "delofesi": "2023-06-26 15:52:54",
                "delonuid": 15320,
                "devidelo": 8,
                "delotinu": "2023-06-26",
                "delokeyw": "acc on",
                "delotime": "230626155253",
                "delosimc": "",
                "delosign": "F",
                "delohour": "205253.00",
                "delosigc": "A",
                "delolati": "10.950521",
                "delolaor": "N",
                "delolong": "-74.792007",
                "deloloor": "W",
                "delospee": "0",
                "delodat1": "",
                "delodat2": "8",
                "deloacc": "1",
                "delodoor": "0",
                "delodat3": null,
                "delodat4": null,
                "delodat5": null
            },
            {
                "delofesi": "2023-06-26 15:52:52",
                "delonuid": 15319,
                "devidelo": 8,
                "delotinu": "2023-06-26",
                "delokeyw": "acc on",
                "delotime": "230626155251",
                "delosimc": "",
                "delosign": "F",
                "delohour": "205251.00",
                "delosigc": "A",
                "delolati": "10.95052",
                "delolaor": "N",
                "delolong": "-74.792008",
                "deloloor": "W",
                "delospee": "0",
                "delodat1": "",
                "delodat2": "8",
                "deloacc": "1",
                "delodoor": "0",
                "delodat3": null,
                "delodat4": null,
                "delodat5": null
            },
            {
                "delofesi": "2023-06-26 15:52:48",
                "delonuid": 15318,
                "devidelo": 8,
                "delotinu": "2023-06-26",
                "delokeyw": "acc off",
                "delotime": "230626155248",
                "delosimc": "",
                "delosign": "F",
                "delohour": "205248.00",
                "delosigc": "A",
                "delolati": "10.950517",
                "delolaor": "N",
                "delolong": "-74.792017",
                "deloloor": "W",
                "delospee": "1.85",
                "delodat1": "84.89",
                "delodat2": "8",
                "deloacc": "1",
                "delodoor": "0",
                "delodat3": null,
                "delodat4": null,
                "delodat5": null
            },
            {
                "delofesi": "2023-06-26 15:52:38",
                "delonuid": 15317,
                "devidelo": 8,
                "delotinu": "2023-06-26",
                "delokeyw": "acc on",
                "delotime": "230626155238",
                "delosimc": "",
                "delosign": "F",
                "delohour": "205238.00",
                "delosigc": "A",
                "delolati": "10.950542",
                "delolaor": "N",
                "delolong": "-74.792098",
                "deloloor": "W",
                "delospee": "0",
                "delodat1": "",
                "delodat2": "8",
                "deloacc": "1",
                "delodoor": "0",
                "delodat3": null,
                "delodat4": null,
                "delodat5": null
            },
            {
                "delofesi": "2023-06-26 15:52:37",
                "delonuid": 15316,
                "devidelo": 8,
                "delotinu": "2023-06-26",
                "delokeyw": "acc off",
                "delotime": "230626155237",
                "delosimc": "",
                "delosign": "F",
                "delohour": "205237.00",
                "delosigc": "A",
                "delolati": "10.950542",
                "delolaor": "N",
                "delolong": "-74.792096",
                "deloloor": "W",
                "delospee": "0",
                "delodat1": "",
                "delodat2": "8",
                "deloacc": "1",
                "delodoor": "0",
                "delodat3": null,
                "delodat4": null,
                "delodat5": null
            },
            {
                "delofesi": "2023-06-26 15:52:21",
                "delonuid": 15315,
                "devidelo": 8,
                "delotinu": "2023-06-26",
                "delokeyw": "acc on",
                "delotime": "230626155221",
                "delosimc": "",
                "delosign": "F",
                "delohour": "205221.00",
                "delosigc": "A",
                "delolati": "10.950485",
                "delolaor": "N",
                "delolong": "-74.792096",
                "deloloor": "W",
                "delospee": "0",
                "delodat1": "",
                "delodat2": "8",
                "deloacc": "1",
                "delodoor": "0",
                "delodat3": null,
                "delodat4": null,
                "delodat5": null
            }
        ]
        //this._map.drawRoute(locations);
        this.dialog.open(DataTimeHComponent, {
            data: {
              deviceId
            },
        });
    }

    formatTimestamp(timestamp: string): string {
        const year = timestamp.slice(0, 2);
        const month = timestamp.slice(2, 4);
        const day = timestamp.slice(4, 6);
        const hour = timestamp.slice(6, 8);
        const min = timestamp.slice(8, 10);
        const sec = timestamp.slice(10, 12);
    
        const formattedDate = `20${year}-${month}-${day} ${hour}:${min}:${sec}`;
        const date = new Date(formattedDate);
    
        return this.datePipe.transform(date, 'yyyy-MM-dd HH:mm:ss') || '';
    }
}