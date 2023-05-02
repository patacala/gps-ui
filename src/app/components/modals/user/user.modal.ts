import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { InputComponent } from '../../input/input.component';
import { MatIconModule } from '@angular/material/icon';
import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { IFormCreate, TRoles, UserService, VehiculeService } from '@services';
import { CommonModule } from '@angular/common';
import { ButtonComponent, SelectComponent, AssignTable, SnackAlert } from '@components';
import { MatSelectModule } from '@angular/material/select';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-user-modal',
    standalone: true,
    imports: [MatIconModule, InputComponent, MatDividerModule, ButtonComponent, ReactiveFormsModule, FormsModule, CommonModule, SelectComponent, AssignTable, MatSelectModule],
    templateUrl: './user.modal.html'
})
export class UserModal implements OnInit {
    @Output('close') close: EventEmitter<void> = new EventEmitter();
    tableContent = [{ key: 'select', name: '' }, { key: 'carrlice', name: 'Placa' }, { key: 'name', name: 'Nombre' }, { key: 'carrtype', name: 'Tipo de vehículo' }, { key: 'gps', name: 'GPS asignado' }, { key: 'states', name: 'Estado' }, { key: 'action', name: 'Acción' }]
    vehicules$!: Observable<any>
    showInformation: boolean = false;
    userGroup!: FormGroup;
    permissions = [
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
    constructor(private fb: FormBuilder, private _user: UserService, private _vehicule: VehiculeService,
        @Inject(MAT_DIALOG_DATA) public data: any, private _snack: SnackAlert) { }

    ngOnInit(): void {
        this.userGroup = this._INIT_FORM;
        if (this.data) {
            this.userGroup.patchValue({
                name: this.data.fullname,
                email: this.data.username,
            })
            this._user.getPrivilegiesByUser(this.data?.usernuid)
            .subscribe((resp: any) => this.userGroup.get('privileges')?.setValue(resp.response))
        }
        this.vehicules$ = this._vehicule.getVehicules();
    }

    get _INIT_FORM(): FormGroup {
        return this.fb.group({
            name: this.fb.nonNullable.control(''),
            email: this.fb.nonNullable.control(''),
            privileges: this.fb.control('')
        })
    }

    createUser(): void {
        const userCreated = this.userGroup.getRawValue();

        this._user.createUser(userCreated).subscribe(() => {
            this._snack.showSuccess('Usuario Creado exitosamente')
            this.closeModal()
        })
    }
    editUser(userId: string): void {
        this._user.editUser(this.userGroup.getRawValue(), userId).subscribe(() => {
            this._snack.showSuccess('Usuario Editado exitosamente')
            this.closeModal()
        })
    }
    closeModal(): void {
        this.close.emit();
    }
}