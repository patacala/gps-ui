import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ButtonComponent, InputComponent, SelectComponent, SnackAlert, TextareaComponent } from '@components';
import { ICompanyCreate, CompanyService, ICompany } from '@services'
import { catchError, of, throwError } from 'rxjs';
@Component({
    selector: 'app-entity-modal',
    templateUrl: './entity.modal.html',
    standalone: true,
    imports: [CommonModule, ButtonComponent, MatDividerModule, InputComponent, SelectComponent, ReactiveFormsModule, FormsModule, MatIconModule, TextareaComponent]
})
export class EntityModal implements OnInit {
    @Output('close') close: EventEmitter<void> = new EventEmitter();
    isEdit: boolean = false;
    entityForm!: FormGroup;
    urlImg: any = '';
    constructor(@Inject(MAT_DIALOG_DATA) private data: any, private sanitizer: DomSanitizer, private fb: FormBuilder, private _company: CompanyService, private _snack: SnackAlert) { }

    ngOnInit(): void {
        this.entityForm = this._INIT_FORM;
        if (this.data) this.configEditModal();
    }

    configEditModal(): void {
        console.log(this.data)
        this.entityForm.patchValue({
            description: this.data.entidesc,
            email: this.data.entimail,
            phone: this.data.entitele
        });
        this.isEdit = true;
    }

    get _INIT_FORM(): FormGroup {
        return this.fb.group({
            documentType: this.fb.nonNullable.control('CEDULA'),
            documentNumber: this.fb.nonNullable.control(''),
            description: this.fb.nonNullable.control(''),
            email: this.fb.nonNullable.control(''),
            phone: this.fb.nonNullable.control(''),
            logo: this.fb.nonNullable.control(''),
        })
    }

    interceptAction(): void {
        this.isEdit ? this.editEntity() : this.createEntity();
    }

    editEntity(): void {
        let company = this.entityForm.getRawValue();

        this._company.updateCompany(this.data.entinuid, company).subscribe((value) => {
            this._snack.showSuccess('Entidad editada correctamente');

            this.closeModal()
        });

    }

    createEntity(): void {
        let formData = new FormData();
        let company = this.entityForm.getRawValue();

        for (let keys in company) {
            formData.append(keys, company[keys]);
        }
        
        this._company.saveCompany(company).subscribe((value) => {
            this._snack.showSuccess('Entidad creada correctamente')
            this.closeModal()
        });
    }

    closeModal(): void {
        this.close.emit();
    }
    uploadPhoto(event: any): void {
        const selectFile = event.target.files[0];
        this.urlImg = this.sanitizer.bypassSecurityTrustUrl(window.URL.createObjectURL(new Blob([selectFile])));
        
        this.entityForm.get('file')?.setValue(selectFile);
    }
}