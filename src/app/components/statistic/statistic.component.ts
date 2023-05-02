import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-statistic',
    standalone: true,
    imports: [CommonModule, MatIconModule],
    templateUrl: './statistic.component.html'
})
export class StatisticComponent {
    @Input() title: string = '';
    @Input() icon: string = '';
    @Input() count: string | number = '';
    constructor() { }
}