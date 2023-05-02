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
    @Input('type') typeButton: 'white' | 'blue' = 'white';
    @Input() width: string = '50%'
    @Input() text!: string;
    @Input() icon!: string;
    public style!: string;
    constructor() { }

    ngOnInit(): void {
        this.style = this.assignStyles;
    }

    get assignStyles(): string {
        return this.typeButton === 'blue' ? 'text-white bg-gps-blue' : 'text-black bg-white border-gps-blue border-1';
    }
}