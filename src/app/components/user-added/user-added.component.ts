import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-user-added',
    standalone: true,
    templateUrl: './user-added.component.html',
    imports: [MatIconModule]
})
export class UserAddedComponent implements OnInit {
    constructor() { }

    ngOnInit(): void {
        console.log('Hola como estas    ')
    }
}