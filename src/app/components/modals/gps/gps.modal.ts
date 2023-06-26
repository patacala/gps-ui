import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { InputComponent } from '../../input/input.component';
import { MatIconModule } from '@angular/material/icon';
import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { ClassifierService, DeviceService, TRoles } from '@services';
import { CommonModule } from '@angular/common';
import { ButtonComponent, SelectComponent, SnackAlert, TreeComponent } from '@components';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { from, map, Observable, tap, toArray } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatGridListModule } from '@angular/material/grid-list'

@Component({
    selector: 'app-gps-modal',
    standalone: true,
    imports: [
        MatAutocompleteModule,
        MatIconModule, InputComponent, MatDividerModule, MatFormFieldModule, MatChipsModule,
        ButtonComponent, ReactiveFormsModule, FormsModule, CommonModule, SelectComponent,
        TreeComponent
    ],
    templateUrl: './gps.modal.html'
})
export class GpsModal implements OnInit {
    @Output('close') close: EventEmitter<void> = new EventEmitter();
    gpsGroup!: FormGroup;
    classifiers$!: Observable<any>
    constructor(private fb: FormBuilder, private _device: DeviceService, private _classifiers: ClassifierService,
        private _snack: SnackAlert, @Inject(MAT_DIALOG_DATA) public data: any) { }

    ngOnInit(): void {
        this.gpsGroup = this._INIT_FORM
        if (this.data) {
            this.gpsGroup.patchValue({
                brand: this.data.devimark,
                imei: this.data.deviimei,
                model: this.data.devimode,
                phoneNumber: this.data.deviphon
            })
            if (this.data.clasdevi.length > 0) {
                this.classifiers$ = from(this.data.clasdevi)
                    .pipe(
                        map((classifier: any) => classifier.clvaclde),
                        toArray()
                    );
            }
        }
    }

    get _INIT_FORM(): FormGroup {
        return this.fb.group({
            brand: this.fb.nonNullable.control(''),
            imei: this.fb.nonNullable.control(''),
            model: this.fb.nonNullable.control(''),
            phoneNumber: this.fb.nonNullable.control(''),
            classifiers: this.fb.control('')
        })
    }

    gpsCreate(): void {
        const userCreated = this.gpsGroup.getRawValue();

        this._device.createDevice(userCreated).subscribe(() => {
            this._snack.showSuccess('Dispositivo creado correctamente');

            this.closeModal();
        })
    }

    gpsUpdate() {
        const deviceUpdate = this.gpsGroup.getRawValue();

        this._device.updateDevice(deviceUpdate, this.data.devinuid).subscribe(() => {
            this._snack.showSuccess('Dispositivo editado correctamente');

            this.closeModal();
        })
    }

    addClassifier(event: any[]) {
        this.gpsGroup.get('classifiers')?.setValue(event)
    }

    closeModal(): void {
        this.close.emit();
    }
}