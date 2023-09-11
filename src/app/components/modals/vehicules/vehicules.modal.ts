import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { InputComponent } from '../../input/input.component';
import { MatIconModule } from '@angular/material/icon';
import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { DeviceService, IFormCreate, TRoles, UserService, VehiculeService } from '@services';
import { CommonModule } from '@angular/common';
import { AssignTable, ButtonComponent, SelectComponent, SnackAlert } from '@components';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-vehicules-modal',
    standalone: true,
    imports: [MatIconModule, InputComponent, MatDividerModule, ButtonComponent, ReactiveFormsModule, FormsModule, CommonModule, SelectComponent, AssignTable],
    templateUrl: './vehicules.modal.html'
})
export class VehiculeModal implements OnInit {
    @Output('close') close: EventEmitter<void> = new EventEmitter();
    roles: Array<TRoles> = ['ADMIN-PRI', 'ADMIN-SEC', 'SUP-ROOT', 'USER'];
    vehiculeGroup!: FormGroup;
    showInformation: boolean = false;
    devices$!: Observable<any>
    tableContent = [{ key: 'select', name: '' }, { key: 'deviimei', name: 'ID' }, { key: 'devimark', name: 'Marca' }, { key: 'devimode', name: 'Modelo' }, { key: 'devistat', name: 'Estado' }]
    constructor(
        private fb: FormBuilder, @Inject(MAT_DIALOG_DATA) public data: any,
        private _vehicule: VehiculeService, private _snack: SnackAlert, private _device: DeviceService
    ) {}

    ngOnInit(): void {
        this.vehiculeGroup = this._INIT_FORM
        if (this.data) {
            const vehicleId = this.data.carrnuid;
            this.vehiculeGroup.patchValue({
                vehicleId,
                plate: this.data.carrlice,
                type: this.data.carrtype,
                currentDeviceImei: this.data?.carrdevi?.device?.deviimei,
                selectedDeviceId: -1
            })
            this.devices$ = this._device.getAvailablesDevices(vehicleId);
        }
    }

    get _INIT_FORM(): FormGroup {
        return this.fb.group({
            vehicleId: this.fb.nonNullable.control(null),
            plate: this.fb.nonNullable.control(''),
            type: this.fb.nonNullable.control(''),
            currentDeviceImei: this.fb.nonNullable.control(''),
            selectedDeviceId: this.fb.nonNullable.control(null)
        })
    }

    selectID(device: any) {
        this.vehiculeGroup.get('deviceId')?.setValue(device.devinuid)
    }

    vehiculeCreate(): void {
        const vehiculeCreated = this.vehiculeGroup.getRawValue();

        if (!vehiculeCreated.deviceId) {
            delete vehiculeCreated.deviceId
        }

        this._vehicule.postVehicule(vehiculeCreated).subscribe(() => {
            this._snack.showSuccess('Vehiculo creado')
            this.close.emit();
        })
    }

    vehiculeEdit() {
        const vehiculeEdit = this.vehiculeGroup.getRawValue();

        if (!vehiculeEdit.deviceId) {
            delete vehiculeEdit.deviceId
        }

        this._vehicule.updateVehicule(vehiculeEdit, this.data.carrnuid).subscribe((res) => {
            console.log(res)
            this._snack.showSuccess('Vehiculo Editado');
            this.close.emit();
        })
    }

    unlinkDevice() {
        this._device.unlinkDevice(this.vehiculeGroup.get('currentDeviceImei')?.value as string).subscribe((res: any) => {
            this._snack.showSuccess(res.message);
            this.vehiculeGroup.get('currentDeviceImei')?.reset();
        })
    }
    closeModal(): void {
        this.close.emit();
    }
}