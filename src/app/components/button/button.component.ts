import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-button',
    templateUrl: './button.component.html',
    standalone: true,
    imports: [CommonModule, MatIconModule]
})
export class ButtonComponent implements OnInit {
    @Input('type') typeButton: 'white' | 'blue' | 'green' | 'gray' = 'white';
    @Input() width: string = '50%'
    @Input() bgColorHex: string = '';
    @Input() text!: string;
    @Input() icon!: string;
    @Input() disabled: boolean = false;
    public style!: string;
    
    constructor() {}

    ngOnInit(): void {
        this.style = this.assignStyles;
    }

    get assignStyles(): string {
        if (this.typeButton === 'blue') return 'text-white bg-gps-blue';
        if (this.typeButton === 'green') return 'text-white bg-gps-green';
        if (this.typeButton === 'gray') return 'text-white bg-gps-gray';
        return 'text-black bg-white border-gps-blue border-1';
    }
}