import { Component, OnInit, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
@Component({
    selector: 'app-input',
    standalone: true,
    template: `
        <label [for]="label">
            <p>{{label}}</p>
            <input [type]="type" [value]="value" (input)="changes($event.target)"
            [placeholder]="placeholder" [disabled]="disabled" style="width: 100%;" 
            class="p-1 border-1 placeholder-pl-4 border-gps-gray-black rounded-md" />
        </label>
    `,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => InputComponent),
            multi: true
        }
    ]
})
export class InputComponent implements OnInit, ControlValueAccessor {
    @Input() label: string = '';
    @Input() placeholder: string = '';
    @Input() type: string = 'text';
    @Input() disabled: boolean = false;
    @Input() value: string = '';
    onChange: any = (_: any) => { }
    onTouch: any = () => { }
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