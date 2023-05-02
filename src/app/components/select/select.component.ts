import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
@Component({
    selector: 'app-select',
    standalone: true,
    imports: [CommonModule],
    template: `
        <label [for]="label">
            <p>{{label}}</p>
            <select (change)="changes($event.target)" style="width: 100%;" 
            class="p-1 border-1 placeholder-pl-4 border-gps-gray-black rounded-md">
                <!-- <option value="" selected disabled>Ver las opciones</option> -->
                <option *ngFor="let option of options" [value]="option">{{option}}</option>
            </select>
        </label>
    `,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SelectComponent),
            multi: true
        }
    ]
})
export class SelectComponent implements OnInit, ControlValueAccessor {
    @Input() label: string = '';
    @Input() options: Array<any> = []
    onChange: any = (_: any) => { }
    onTouch: any = () => { }
    value!: string;
    constructor() { }

    ngOnInit(): void { }

    changes(event: EventTarget | null) {
        const value = (event as HTMLInputElement).value;

        this.onChange(value);
        this.onTouch();
    }

    writeValue(value: any) { this.value = value }
    registerOnTouched(fn: any) { this.onTouch = fn }
    registerOnChange(fn: any) { this.onChange = fn }
}