import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { TreeComponent } from '../tree-classifiers/tree.component';
import { ClassifierService, MapService } from '@services';
import { interval, Subject, Subscription } from 'rxjs';
import { filter, pairwise } from 'rxjs/operators';
import { AsyncPipe, DatePipe, JsonPipe, NgIf } from '@angular/common';
import { ButtonComponent } from '../button/button.component';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { InputComponent } from '../input/input.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatNativeDateModule, ThemePalette } from '@angular/material/core';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { Device, KmTraveled, LocationData } from './map.model';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DataTimeHComponent } from '../data-time-h/data-time-h.component';
import { ItemDtDvComponent } from '../item-dt-dv/item-dt-dv.component';
import { DeviceService } from '@services';
import { NgForOf } from '@angular/common';
import { ConfigDeviceCommandsComponent } from '../config-device-commands/config-device-commands.component';
import { DownloadsCsvComponent } from '../downloads-csv/downloads-csv.component';

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
        MatSelectModule, MatInputModule,
        MatIconModule, MatSlideToggleModule,
        MatDialogModule, ItemDtDvComponent,
        JsonPipe, DatePipe, NgForOf
    ],
    providers: [DatePipe],
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
    displayedColumns: string[] = ['select', 'imei', 'plate'];
    maxDate: string = '';
    devicesTable: Device[]=[];
    devicesRPross: [LocationData[], KmTraveled[]]=[[],[]];
    devicesFilter: LocationData[]=[];
    kmTraveled: KmTraveled[]=[];
    divicesFilterId: any[]=[];
    switchOnOff: boolean = true;
    subscription: Subscription | undefined;
    dataSDevices = new MatTableDataSource<Device>([]);
    checksDevices = new SelectionModel<Device>(true, []);
    color: ThemePalette = 'primary';
    hiddenIconLHisto: boolean = false;
    hiddenListHisto: boolean = false;
    
    @ViewChild('detailsVehicule') details!: MatDrawer;
    showFiller = false;
    devices!: Array<any>;
    devicesFound: Array<any> = [];
    deviceSelected$: Subject<any> = new Subject();
    currentDvId: number = -1;
    classifiers!: any;
    subscriptions: Subscription[] = [];
    formFilter = new FormGroup({
       /*  plate: new FormControl<String | null>(null), */
        startDateOnly: new FormControl<Date | null>(new Date(), Validators.required),
        endDateOnly: new FormControl<Date | null>(new Date(), Validators.required),
        isLocation: new FormControl<Boolean | true>(true),
        isEvent: new FormControl<Boolean | false>(false),
        withAlert: new FormControl<Boolean | false>(false)
    });
    
    constructor(
        private _map: MapService, 
        private _classifier: ClassifierService,
        private _device: DeviceService, 
        private _utils: UtilsService,
        public dialog: MatDialog,
        private datePipe: DatePipe
    ) {}

    ngOnInit(): void {
        this._map.drawMap('map');
        this.getHiddenIconLHisto();
        this.getHiddenListHisto();
        this.resetFormFilter();
        
        setTimeout(() => {
            this.initialMapDevsLoc();
        }, 100);

        this._map.getDeviceObs().subscribe((selectedDeviceId: number) => {
            if (this.currentDvId !== selectedDeviceId) {
                this.currentDvId = selectedDeviceId;
                const indexDv = this.devicesFound.findIndex(dv => dv.devinuid == selectedDeviceId);
                this.deviceSelected$.next(this.devicesFound[indexDv]);
                this._map.drawDvsMainLoc([this.devicesFound[indexDv]]);
                this.suscriptRealTime();
                this.details.open();
            } else {
                if (this.subscription && !this.subscription.closed) {
                    this.subscription.unsubscribe(); // Pausar la suscripción
                }
                this.currentDvId = -1;
                this.closeToggle(selectedDeviceId.toString());
            }

            this._map.clearMapHistory(selectedDeviceId.toString());
        });

        this.deviceSelected$.pipe(
            pairwise(),
            filter(([previousValue, currentValue]) => previousValue?.deviloca[0]?.delofesi !== currentValue?.deviloca[0]?.delofesi)
        ).subscribe(([, currentValue]) => {
            this._map.drawDvsMainLoc([currentValue]);
        });
          
        this.maxDate = this._utils.getCurrentDateTime();
    }

    suscriptRealTime() {
        this.subscription = interval(10000).subscribe(() => {
            this.initialMapDevsLoc();
        });
    }

    initialMapDevsLoc() {
        this._map.getLocationDevices(null).subscribe((data: any) => {
          if (data && data?.response?.rows) {
            const rowDevice = data.response.rows;
      
            if (this.devicesFound.length === 0) {
              this.devicesFound = rowDevice;
            } else {
                // Filtrar los registros de rowDevice que también están en devicesFound
                this.devicesFound = rowDevice.filter((rdv: { devinuid: any }) =>
                    this.devicesFound.some((df: { devinuid: any }) => df.devinuid === rdv.devinuid)
                );
            }

            const indexDv = this.devicesFound.findIndex(dv => dv.devinuid == this.currentDvId);
            if (indexDv === -1) {
              this._map.drawDvsMainLoc(this.devicesFound);
            } else if (indexDv !== -1) {
              this.deviceSelected$.next(this.devicesFound[indexDv]);
            }
      
            this.devicesTable = this._device.rowsDeviceTable(rowDevice);
            this.dataSDevices.data = this.devicesTable;
            const dataSDevicesLength = this.dataSDevices.data.length;

            if (dataSDevicesLength > 0) {
                if (dataSDevicesLength === this.devicesFound.length) {
                    this.toggleAllRows();
                } else {
                    this.toggleCurrentRows();
                }
            }
          }
        });
    }
      
    filterDevices() {
        // Obtener los IDs de los dispositivos seleccionados
        const selectedDeviceIds = this.checksDevices.selected.map(device => device.devinuid);
      
        // Realizar la filtración de dispositivos
        this._map.getLocationDevices(null).subscribe((data: any) => {
          if (data && data.response && data.response.rows) {
            const allDevices = data.response.rows;
      
            // Filtrar los dispositivos basados en los IDs seleccionados
            const filteredDevices = allDevices.filter((device: { devinuid: number; }) => selectedDeviceIds.includes(device.devinuid));
    
            this.devicesFound = filteredDevices;
            this._map.drawDvsMainLoc(this.devicesFound);
          }
        });
    }

    processFilterId(datas: any) {
        datas?.forEach((element: any) => {
            this.divicesFilterId.push(element?.devinuid)
        });
    }

    processFilterData(datas: any): [LocationData[], KmTraveled[]] {
        const newLocData: LocationData[] = [];
        const newKmTraveled: KmTraveled[] = [];

        const mappedLocData = datas?.map((data:any) => ({
            deviimei: data.deviimei,
            devimark: data.devimark,
            devimode: data.devimode,
            deviphon: data.deviphon,
            carrlice: data.carrdevi?.carrier?.carrlice,
            carrtype: data.carrdevi?.carrier?.carrtype,
            locations: {
                delolati: data.locations.map((loc: any) => loc.delolati),
                delolong: data.locations.map((loc: any) => loc.delolong),
                delodire: data.locations.map((loc: any) => loc.delodire),
                delobarri: data.locations.map((loc: any) => loc.delobarri),
                delofesi: data.locations.map((loc: any) => loc.delofesi),
                delotime: data.locations.map((loc: any) => loc.delotime),
                delospee: data.locations.map((loc: any) => loc.delospee),
                keywfunc: data.locations.map((loc: any) => loc.keywords.keywfunc),
            }
        }));
        
        const mappedKmTraveled = datas?.map((data:any) => ({
            deviimei: data.deviimei,
            devimark: data.devimark,
            devimode: data.devimode,
            deviphon: data.deviphon,
            carrlice: data.carrdevi?.carrier?.carrlice,
            carrtype: data.carrdevi?.carrier?.carrtype,
            kmTraveled: {
                kmdiacapt: data.kmdevi.map((km: any) => km.kmdiacapt),
                kmcapt: data.kmdevi.map((km: any) => km.kmcapt)
            }
        }));

        mappedLocData?.forEach((row: any) => {
            const locations = row.locations;
            locations.delolati.forEach((lat: any, index: number) => {
                newLocData.push({
                    IMEI: row.deviimei,
                    MARCA: row.devimark,
                    MODELO: row.devimode,
                    CELULAR: row.deviphon,
                    PLACA: row.carrlice,
                    "TIPO VEHICULO": row.carrtype,
                    LATITUD: lat,
                    LONGITUD: locations.delolong[index],
                    DIRECCION: locations.delodire[index],
                    BARRIO: locations.delobarri[index],
                    EVENTO: locations.keywfunc[index],
                    "FECHA SISTEMA": locations.delofesi[index],
                    "FECHA REGISTRO": this.formatTimestamp(locations.delotime[index]),
                    VELOCIDAD: locations.delospee[index],
                });
            });
        });

        mappedKmTraveled?.forEach((row: any) => {
            const kmTraveled = row.kmTraveled;
            kmTraveled.kmdiacapt.forEach((kmDayCapt: any, index: number) => {
                newKmTraveled.push({
                    IMEI: row.deviimei,
                    MARCA: row.devimark,
                    MODELO: row.devimode,
                    CELULAR: row.deviphon,
                    PLACA: row.carrlice,
                    "TIPO VEHICULO": row.carrtype,
                    "KM DÍA": kmDayCapt,
                    "KM GENERADO": kmTraveled.kmcapt[index]
                });
            });
        });

        return [newLocData, newKmTraveled];  
    }

    saveClassifiers(event: any) {
        this.classifiers = event;
    }

    // Método para verificar si todas las filas están seleccionadas
    isAllSelected(): boolean {
        const numSelected = this.checksDevices.selected.length;
        const numRows = this.dataSDevices.data.length;
        return numSelected === numRows;
    }

    toggleAllRows() {
        if (this.isAllSelected()) {
          this.checksDevices.clear();
          return;
        }
        
        this.checksDevices.select(...this.dataSDevices.data);
    }

    toggleCurrentRows() {
        this.devicesTable = this._device.rowsDeviceTable(this.devicesFound);
        const selectedRows = this.devicesTable.filter(row => this.dataSDevices.data.some(d => d.devinuid === row.devinuid));
        
        // Crear un conjunto (Set) para garantizar la unicidad de las filas basadas en devinuid
        const uniqueRowsSet = new Set<number>();
        
        // Array para almacenar filas únicas
        const uniqueRows: Device[] = [];
        
        this.dataSDevices.data.forEach(row => {
            if (!uniqueRowsSet.has(row.devinuid)) {
                uniqueRowsSet.add(row.devinuid);
                uniqueRows.push(row);
            }
        });
        
        // Actualizar el dataSDevices.data con las filas únicas
        this.dataSDevices.data = uniqueRows;
    
        // Seleccionar las filas filtradas en el SelectionModel
        this.checksDevices.select(...selectedRows);  // Usamos spread operator (...) aquí
    }
    
    clearClassifiers() {
        this.classifiers = [];
        this._classifier.clearCheckboxes.emit();
    }

    checkboxLabel(row?: Device): string {
        if (!row) {
          return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
        }
        return `${this.checksDevices.isSelected(row) ? 'deselect' : 'select'} row ${row.devinuid + 1}`;
    }

    validDisabledArray(...arrays: Array<any>[]): boolean {
        for (const array of arrays) {
          if (Array.isArray(array) && array.length > 0) {
            return false;
          }
        }
        return true;
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSDevices.filter = filterValue.trim().toLowerCase();
    }

    upperCase(event: any) {
        const input = event.target.value;
        const uppercase = input.toUpperCase();
        event.target.value = uppercase;
    }

    listClassifiers(data: any) {
        const classifiers: string[] = [];
        if(data && typeof(data) != undefined) {
            
            data.forEach((element: any) => {
                const clvadesc = element?.classvalue?.clvadesc;
                if (clvadesc) {
                    classifiers.push(clvadesc);
                }
            });
        }

        return classifiers.join(', ');
    }
  
    openDialogHistory(deviceId: number) {
        this.dialog.open(DataTimeHComponent, {
            width:'360px',
            data: {
              deviceId
            },
        });
    }

    openDialogConfigCommans(deviceId: number) {
        this.dialog.open(ConfigDeviceCommandsComponent, {
            width:'270px',
            data: {
              deviceId
            },
        });
    }

    clearMapHistory(key: string) {
        this._map.clearOpenInfoLoc();
        this._device.clearHistoryLoc();
        this._map.clearMapHistory(key);
        this._map.hiddenIconLHisto(false);
        this._map.hiddenListHisto(true);
    }

    closeToggle(key: string) {
        this._map.clearOpenInfoLoc();
        this._device.clearHistoryLoc();
        this._map.clearMapHistory(key);
        this._map.hiddenIconLHisto(false);
        this._map.hiddenListHisto(true);
        this.currentDvId = -1;
        this._map.drawDvsMainLoc(this.devicesFound);
        this.subscription?.unsubscribe();
        this.details.close();
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

    validBtnDelHLoc() {
        return this._device.validHistoryLoc();
    }

    changeOffOnDv(event: MatSlideToggleChange) {
       const stepexec = event.source.checked ? 5:1;
       this._device.executeParamDevice({
            stepexec,
            deviexec: parseInt(this.currentDvId.toString()),
            execparam: null
        }).subscribe((data: any) => {
            console.log(data);
        });
    }

    resetFormFilter() {
        this.formFilter.reset({
            startDateOnly: this._utils.currentDate(),
            endDateOnly: this._utils.currentDate(),
            isLocation: true,
            isEvent: false,
            withAlert: false
        });
    }

    clearFilter() {
        this.clearClassifiers();
        this.resetFormFilter();         
        this.checksDevices.clear();
        this.devicesFilter = [];
        this.initialMapDevsLoc();
    }

    setHiddenListHisto() {
        this.hiddenListHisto = !this.hiddenListHisto;
        this._map.hiddenListHisto(this.hiddenListHisto);
    }

    getHiddenIconLHisto() {
        this._map.gethiddenIconLHisto().subscribe((val: boolean) => {
            this.hiddenIconLHisto = val;
        });
    }

    getHiddenListHisto() {
        this._map.getHiddenListHisto().subscribe((val: boolean) => {
            this.hiddenListHisto = val;
        });
    }

    openDialogCsv() {
        this.dialog.open(DownloadsCsvComponent, {
            width:'360px',
            data: {
                devicesFound: this.checksDevices.selected,
                classifiers: this.classifiers?.flat().filter((item: any) => item != null) ?? []
            },
        });
    }
}