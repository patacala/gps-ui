import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { InputComponent } from '../../input/input.component';
import { MatIconModule } from '@angular/material/icon';
import { ChangeDetectorRef, Component, EventEmitter, Inject, OnInit, Output, ViewChild } from '@angular/core';
import { DeviceService, MapService, UserService } from '@services';
import { CommonModule } from '@angular/common';
import { ButtonComponent, SelectComponent, SnackAlert } from '@components';
import { MatSelectModule } from '@angular/material/select';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { Device } from '../../map/map.model';
import { SelectionModel } from '@angular/cdk/collections';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
    selector: 'app-user-modal',
    standalone: true,
    imports: [
        MatIconModule, 
        InputComponent, 
        MatDividerModule, 
        ButtonComponent, 
        ReactiveFormsModule, 
        FormsModule, 
        CommonModule, 
        SelectComponent, 
        MatSelectModule,
        MatCheckboxModule,
        MatTableModule,
        MatSortModule,
        MatPaginatorModule
    ],
    templateUrl: './user.modal.html'
})
export class UserModal implements OnInit {
    @Output('close') close: EventEmitter<void> = new EventEmitter();
    tableContent = [{ key: 'select', name: '' }, { key: 'carrlice', name: 'Placa' }, { key: 'name', name: 'Nombre' }, { key: 'carrtype', name: 'Tipo de vehículo' }, { key: 'gps', name: 'GPS asignado' }, { key: 'states', name: 'Estado' }, { key: 'action', name: 'Acción' }]
    vehicules$!: Observable<any>
    showInformation: boolean = false;
    userGroup!: FormGroup;
    dataSDevices: MatTableDataSource<any>;
    displayedColumns: string[] = ['select', 'imei', 'plate'];
    checksDevices = new SelectionModel<Device>(true,[]);
    
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    permissions = [
        {
            key: 'locations_read',
            description: 'Ver mapa'
        },
        {
            key: 'entity_get',
            description: 'Listar entidades'
        },
        {
            key: 'entity_create',
            description: 'Crear Entidades'
        },
        {
            key: 'entity_update',
            description: 'Actualizar entidades'
        },
        {
            key: 'entity_delete',
            description: 'Eliminar entidades'
        },
        {
            key: 'user_get',
            description: 'Listar usuarios'
        },
        {
            key: 'user_create',
            description: 'Crear usuario'
        },
        {
            key: 'user_update',
            description: 'Actualzar usuario'
        },
        {
            key: 'user_delete',
            description: 'Eliminar user'
        },
        {
            key: 'user_get_privileges',
            description: 'Obtener Privilegios'
        },
        {
            key: 'device_get',
            description: 'Listar dispositivos'
        },
        {
            key: 'device_create',
            description: 'Crear dispositivos'
        },
        {
            key: 'device_update',
            description: 'Actualizar dispositivos'
        },
        {
            key: 'device_delete',
            description: 'Elimninar dispositivos'
        },
        {
            key: 'device_unlink',
            description: 'Desvincular dispositivo de vehiculos'
        },
        {
            key: 'carrier_get',
            description: 'Listar vehiculos'
        },
        {
            key: 'carrier_create',
            description: 'Crear vehiculo'
        },
        {
            key: 'carrier_update',
            description: 'Actualizar vehiculo'
        },
        {
            key: 'carrier_delete',
            description: 'Eliminar vehiculos'
        },
        {
            key: 'clasifiers_get',
            description: 'Listar clasificadores'
        },
        {
            key: 'clasifiers_create',
            description: 'Crear clasificadores'
        },
        {
            key: 'clasifiers_update',
            description: 'Actualizar clasificadores'
        },
        {
            key: 'clasifiers_delete',
            description: 'Eliminar clasificadores'
        },
        {
            key: 'privileges_get',
            description: 'Listar privilegios'
        }
    ]
    constructor(
        private fb: FormBuilder, 
        private _user: UserService, 
        @Inject(MAT_DIALOG_DATA) public data: any, 
        private _snack: SnackAlert,
        private _map: MapService,
        private _device: DeviceService, 
        private matPaginatorIntl: MatPaginatorIntl,
        private changeDetectorRef: ChangeDetectorRef,
    ) {
        this.dataSDevices = new MatTableDataSource<Device>();
        this.matPaginatorIntl.itemsPerPageLabel = 'Dispositivos por página:';
        this.paginator = new MatPaginator(this.matPaginatorIntl, this.changeDetectorRef);
        this.sort = new MatSort();
        this.deviceList();
    }

    ngOnInit(): void {
        this.userGroup = this._INIT_FORM;
        if (this.data) {
            this.userGroup.patchValue({
                name: this.data.fullname,
                email: this.data.username
            })
            this._user.getPrivilegiesByUser(this.data?.usernuid)
            .subscribe((resp: any) => this.userGroup.get('privileges')?.setValue(resp.response))
        }
    }

    get _INIT_FORM(): FormGroup {
        return this.fb.group({
            name: this.fb.nonNullable.control(''),
            email: this.fb.nonNullable.control(''),
            privileges: this.fb.control(''),
            deviceSelected: this.fb.control([]),
        })
    }

    createUser(): void {
        this.userGroup.get('deviceSelected')?.setValue(
            this.checksDevices.selected.map((device) => device.devinuid)
        );
        const userCreated = this.userGroup.getRawValue();
        this._user.createUser(userCreated).subscribe(() => {
            this._snack.showSuccess('Usuario Creado exitosamente')
            this.closeModal()
        })
    }
    
    editUser(userId: string): void {
        this.userGroup.get('deviceSelected')?.setValue(
            this.checksDevices.selected.map((device) => device.devinuid)
        );
        this._user.editUser(this.userGroup.getRawValue(), userId).subscribe(() => {
            this._snack.showSuccess('Usuario Editado exitosamente')
            this.closeModal()
        })
    }

    deviceList() {
        let userNuId = this.data?.usernuid;
        if (!userNuId) userNuId = null;

        this._map.getLocationDevices(userNuId).subscribe((data: any) => {
            if (data && data?.response?.rows) {
                const rowDevice = data.response.rows;
                const resultRowDevs = this._device.rowsDeviceTable(rowDevice);
                
                if (resultRowDevs) {
                    this.dataSDevices.data = resultRowDevs;
                    this.dataSDevices.paginator = this.paginator;
                    this.dataSDevices.sort = this.sort;
                    this.isSelecteds();
                }
            }
        });
    }
    
    isAllSelected() {
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

    isSelecteds() {
        const devicesSelected = this.dataSDevices.data.filter(device => device.check == true); 
        this.checksDevices.select(...devicesSelected);
    }

    checkboxLabel(row?: Device): string {
        if (!row) {
          return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
        }
        return `${this.checksDevices.isSelected(row) ? 'deselect' : 'select'} row ${row.devinuid + 1}`;
    }

    closeModal(): void {
        this.close.emit();
    }
}