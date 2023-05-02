import { NgIf } from "@angular/common";
import { Component, EventEmitter, Inject, OnInit, Output } from "@angular/core";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { InputComponent, ButtonComponent, SnackAlert } from "@components";
import { ClassifierService } from "@services";

@Component({
    selector: 'app-classifier-modal',
    templateUrl: './create-classifier.modal.html',
    imports: [NgIf, InputComponent, ButtonComponent, FormsModule, ReactiveFormsModule, MatSlideToggleModule],
    standalone: true,
})
export class CreateClassifiers implements OnInit {
    name: FormControl = new FormControl();
    status: FormControl = new FormControl();
    @Output() close: EventEmitter<void> = new EventEmitter();

    constructor(private _classifier: ClassifierService, @Inject(MAT_DIALOG_DATA) public data: any, private _snack: SnackAlert) { }

    ngOnInit(): void {
        if (this.data) {
            this.name.setValue(this.data.clasdesc)
            this.status.setValue(this.data.classtat)
        }
    }

    closeModal() {
        this.close.emit();
    }

    createClassifier() {
        this._classifier.createClassifier(this.name.value).subscribe((val: any) => {
            if (val.ok) {
                this._snack.showSuccess('Clasificador creado correctamente');
                this.closeModal()
            }
        });
    }

    updatedClassifier() {
        console.log(this.name.value)
        this._classifier.updateClassifier(this.data.clasnuid, { name: this.name.value, status: this.status.value }).subscribe((val: any) => {
            if (val.ok) {
                this._snack.showSuccess('Clasificador editado correctamente');
                this.closeModal()
            }
        })
    }
}