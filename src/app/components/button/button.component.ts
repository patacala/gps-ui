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
    @Input('type') typeButton: 'white' | 'blue' | 'green' = 'white';
    @Input() width: string = '50%'
    @Input() text!: string;
    @Input() icon!: string;
    public style!: string;
    
    constructor() {}

    ngOnInit(): void {
        this.style = this.assignStyles;
    }

    get assignStyles(): string {
        if (this.typeButton === 'blue') return 'text-white bg-gps-blue';
        if (this.typeButton === 'green') return 'text-white bg-gps-green';
        return 'text-black bg-white border-gps-blue border-1';
    }
}