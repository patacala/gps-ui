import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core'
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute } from '@angular/router';
import { ButtonComponent, InputComponent, SelectComponent, SnackAlert } from '@components'
import { ClassifierService } from '@services';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
@Component({
    selector: 'app-add-option',
    templateUrl: 'add-option.modal.html',
    standalone: true,
    imports: [NgIf, NgForOf, AsyncPipe, ButtonComponent, InputComponent, SelectComponent, FormsModule, ReactiveFormsModule, MatSelectModule]
})
export class AddOptionModal implements OnInit {
    @Output() close: EventEmitter<void> = new EventEmitter();
    childs$!: Observable<any>;
    childForm!: FormGroup;
    constructor(private fb: FormBuilder, private _snack: SnackAlert, @Inject(MAT_DIALOG_DATA) public data: any, private _classifier: ClassifierService) { }

    ngOnInit() {
        this.childs$ = this._classifier.getChilds(this.data.clasnuid || this.data.clasclva);
        this.childForm = this._INIT_FORM;

        this.childForm.get('principalParent')?.setValue(this.data.clasnuid);
        if(this.data.isChild) this.childForm.get('name')?.setValue(this.data.clvadesc);
    }

    get _INIT_FORM() {
        return this.fb.group({
            name: ['', Validators.required],
            principalParent: [, Validators.required],
            directParent: [, Validators.required]
        })
    }

    closeModal() {
        this.close.emit()
    }

    addOption() {
        this._classifier.createChild({ ...this.childForm.getRawValue() }).subscribe((val: any) => {
            if (val.ok) {
                this._snack.showSuccess('Option creado correctamente');
                this.closeModal();
            }
        })
    }

    editOption() {
        this._classifier.updateChild(this.data.clvanuid, { name: this.childForm.get('name')?.value }).subscribe((val: any) => {
            console.log(val)
            if (val.ok) {
                this._snack.showSuccess('Option editado correctamente');
                this.closeModal();
            }
        })
    }
}