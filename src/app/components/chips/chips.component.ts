import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-chips',
    standalone: true,
    templateUrl: './chips.component.html'
})
export class ChipsComponent implements OnInit {
    @Input() text!: string;
    bgColor!: string;
    constructor() { }

    ngOnInit(): void {
        this.bgColor = this.backgroundColor;
    }

    get backgroundColor(): string {
        return this.text === 'Activo' ? 'bg-gps-green' : 'bg-gps-red';
    }
}