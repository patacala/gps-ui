import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class SnackAlert {
    constructor(private _snack: MatSnackBar) { }

    showError(message: string = "Error"): void {
        this._snack.open(message, '', {
            duration: 600,
            panelClass: 'snack_error'
        })
    }
    showSuccess(message: string = "Success"): void {
        this._snack.open(message, '', {
            duration: 600,
            panelClass: 'snack_success'
        })
    }
}