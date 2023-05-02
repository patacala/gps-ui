import { Component, OnInit, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
@Component({
    selector: 'app-textarea',
    templateUrl: './textarea.component.html',
    standalone: true,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => TextareaComponent),
            multi: true
        }
    ]
})
export class TextareaComponent { 
    @Input() label: string = '';
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