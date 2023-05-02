import { Component } from "@angular/core";
import { Router } from "@angular/router";

@Component({
    selector: 'app-register-sended',
    templateUrl: './register-sended.component.html',
    standalone: true,
})
export class RegisterSendedComponent {
    constructor(private router: Router) { }

    backToInit(){
        this.router.navigate(['/'])
    }
}