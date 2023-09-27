import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { TreeComponent } from '../tree-classifiers/tree.component';
import { ClassifierService, MapService } from '@services';
import { interval, Subject, Subscription } from 'rxjs';
import { filter, pairwise } from 'rxjs/operators';
import { AsyncPipe, DatePipe, JsonPipe, NgIf } from '@angular/common';
import { ButtonComponent } from '../button/button.component';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { InputComponent } from '../input/input.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule, ThemePalette } from '@angular/material/core';
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
import { UtilsService } from 'src/app/services/utils/utils.service';

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
    @ViewChild('drawerLeft') drawerLeft!: MatDrawer;
    @ViewChild('detailsVehicule') details!: MatDrawer;

    displayedColumns: string[] = ['select', 'imei', 'plate'];
    maxDate: string = '';
    rowsDevice: any[]=[];
    devicesTable: Device[]=[];
    devicesRPross: [LocationData[], KmTraveled[]]=[[],[]];
    kmTraveled: KmTraveled[]=[];
    divicesFilterId: any[]=[];
    switchOnOff: boolean = true;
    subscription: Subscription | undefined;
    dataSDevices = new MatTableDataSource<Device>([]);
    checksDevices: Device[]=[];
    color: ThemePalette = 'primary';
    hiddenIconLHisto: boolean = false;
    hiddenListHisto: boolean = false;
    sizeLevel: number = 1;
    showFiller = false;
    devices!: Array<any>;
    devicesFound: Array<any> = [];
    deviceSelected$: Subject<any> = new Subject();
    currentDvId: number = -1;
    classifiers!: any;
    
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
        this.suscriptRealTime(60000);
        
        setTimeout(() => {
            this.initialMapDevsLoc();
        }, 100);

        this._map.getDeviceObs().subscribe((selectedDeviceId: number) => {
            if (this.currentDvId !== selectedDeviceId) {
                this.currentDvId = selectedDeviceId;
                const indexDv = this.devicesFound.findIndex(dv => dv.devinuid == selectedDeviceId);
                this.deviceSelected$.next(this.devicesFound[indexDv]);
                this._map.drawDvsMainLoc([this.devicesFound[indexDv]]);
                this.suscriptRealTime(10000);
                this.details.open();
            } else {
                this.currentDvId = -1;
                this.suscriptRealTime(60000);
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
    }

    suscriptRealTime(intervalTime: number) {
        this.subscription?.unsubscribe();
        this.subscription = interval(intervalTime).subscribe(() => {
            this.initialMapDevsLoc();
        });
    }

    initialMapDevsLoc() {
        this._map.getLocationDevices(null).subscribe((data: any) => {
          if (data && data?.response?.rows) {
            this.rowsDevice = data.response.rows;
      
            if (this.devicesFound.length === 0) {
              this.devicesFound = this.rowsDevice;
            } else {
                // Filtrar los registros de rowDevice que también están en devicesFound
                this.devicesFound = this.rowsDevice.filter((rdv: { devinuid: any }) =>
                    this.devicesFound.some((df: { devinuid: any }) => df.devinuid === rdv.devinuid)
                );
            }

            const indexDv = this.devicesFound.findIndex(dv => dv.devinuid == this.currentDvId);
            if (indexDv === -1) {
              this._map.drawDvsMainLoc(this.devicesFound);
            } else if (indexDv !== -1) {
              this.deviceSelected$.next(this.devicesFound[indexDv]);
            }
      
            this.devicesTable = this._device.rowsDeviceTable(this.rowsDevice);
            this.dataSDevices.data = this.devicesTable;
            const dataSDevicesLength = this.dataSDevices.data.length;

            if (dataSDevicesLength > 0) {
                if (dataSDevicesLength === this.devicesFound.length) {
                    this.toggleAllRows(true);
                } else {
                    this.toggleCurrentRows();
                }
            }
          }
        });
    }

    openFilterDevice() {
        const isOpen = this.drawerLeft.opened;
        if (isOpen) {
            this.drawerLeft.close();
            this.suscriptRealTime(60000);
        } else {
            this.drawerLeft.open();
            this.subscription?.unsubscribe();
        }
    }
      
    filterDevices() {
        // Obtener los IDs de los dispositivos seleccionados
        const selectedDeviceIds = this.checksDevices.map(device => device.devinuid);
        const filteredDevices = this.rowsDevice.filter((device: { devinuid: number; }) => selectedDeviceIds.includes(device.devinuid));
        this.devicesFound = filteredDevices;
        this._map.drawDvsMainLoc(this.devicesFound);
        this._utils.matSnackBar('Filtro aplicado', 'ok');
    }

    processFilterId(datas: any) {
        datas?.forEach((element: any) => {
            this.divicesFilterId.push(element?.devinuid)
        });
    }

    saveClassifiers(event: any) {
        this.classifiers = event;
    }

    // Método para verificar si todas las filas están seleccionadas
    isAllSelected(): boolean {
        const dataSDevices = this.dataSDevices.data;
        const numSelected = dataSDevices.filter(row => row.check).length;
        const numRows = dataSDevices.length;
        return numSelected === numRows;
    }

    toggleAllRows(event: boolean) {
        const dataSDevices = this.dataSDevices.data;
        if (event) {
            dataSDevices.forEach(row => {
                row.check = true;
            });
        } else {
            dataSDevices.forEach(row => {
                row.check = false;
            });
        }

        this.checksDevices = [];
        this.checksDevices = dataSDevices.filter(dataDv => dataDv.check);
    }

    toggleCurrentRow(row: any) {
        this.checksDevices = [];
        
        row.check = !row.check;
        const dataSDevices = this.dataSDevices.data;
        this.checksDevices = dataSDevices.filter(dataDv => dataDv.check);
    }

    toggleCurrentRows() {
        this.devicesTable = this._device.rowsDeviceTable(this.devicesFound);
        const selectedRows = this.devicesTable.filter(row => this.dataSDevices.data.some(d => d.check === row.check));
        
        this.dataSDevices.data.forEach(row1 => {
            const isSelected = selectedRows.some((row2: { devinuid: number; }) => row1.devinuid === row2.devinuid);
            row1.check = isSelected;
        });
    }

    clearClassifiers() {
        this.classifiers = [];
        this._classifier.clearCheckboxes.emit();
    }

    checkboxLabel(row?: Device): string {
        if (!row) {
          return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
        }
        return `${row.check ? 'deselect' : 'select'} row ${row.devinuid + 1}`;
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
        this._map.hiddenListHisto({hiddenListHisto: true, sizeControl: this.sizeLevel});
    }

    closeToggle(key: string) {
        this._map.clearOpenInfoLoc();
        this._device.clearHistoryLoc();
        this._map.clearMapHistory(key);
        this._map.hiddenIconLHisto(false);
        this._map.hiddenListHisto({hiddenListHisto: true, sizeControl: this.sizeLevel});
        
        this.currentDvId = -1;
        this._map.drawDvsMainLoc(this.devicesFound);
        this.suscriptRealTime(60000);
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

    setHiddenListHisto() {
        this.hiddenListHisto = !this.hiddenListHisto;
        this._map.hiddenListHisto({hiddenListHisto: this.hiddenListHisto , sizeControl: this.sizeLevel});
    }

    setSizeControl() {
        this.sizeLevel = this.sizeLevel === 1 ? 2:1;
        this._map.hiddenListHisto({hiddenListHisto: this.hiddenListHisto , sizeControl: this.sizeLevel});
    }

    getHiddenIconLHisto() {
        this._map.gethiddenIconLHisto().subscribe((val: boolean) => {
            this.hiddenIconLHisto = val;
        });
    }

    getHiddenListHisto() {
        this._map.getHiddenListHisto().subscribe((val: any) => {
            this.hiddenListHisto = val?.hiddenListHisto;
            this.sizeLevel = val?.sizeControl;
        });
    }

    openDialogCsv() {
        this.dialog.open(DownloadsCsvComponent, {
            width:'360px',
            data: {
                devicesFound: this.checksDevices.map(devF => devF.devinuid),
                classifiers: this.classifiers?.flat().filter((item: any) => item != null) ?? []
            },
        });
    }
}