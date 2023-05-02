import { Component, OnInit } from "@angular/core";
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { TableComponent } from '@components';
import { ClassifierService } from "@services";
import { Observable } from "rxjs";
import { AddOptionModal, CreateClassifiers } from '@modals';
import { Router } from "@angular/router";
@Component({
    selector: 'app-classifiers',
    templateUrl: './classifiers.component.html',
    styleUrls: ['./classifiers.component.scss'],
    standalone: true,
    imports: [CommonModule, MatDialogModule, TableComponent],
})
export class ClassifiersComponent implements OnInit {
    tableContent = [{ key: 'clasnuid', name: 'ID' }, { key: 'clasdesc', name: 'Clasificador' }, { key: 'classtat', name: 'Estado' }, { key: 'classifiersMainActions', name: 'Acción' }]
    classifiers$!: Observable<any>;

    constructor(private dialog: MatDialog, private _classifier: ClassifierService, private router: Router) { }

    ngOnInit(): void {
        this.classifiers$ = this._classifier.getClassifier();
    }

    actions(event: { type: string, data: any }) {
        if (['Add'].includes(event.type)) {
            this.openOption(event.data);
        }
        if (['Watch'].includes(event.type)) {
            this.router.navigate([`app/clasificadores/${event.data.clasnuid}`])
        }
        if (['Edit'].includes(event.type)) {
            this.openCreate(event.data)
        }
    }

    openCreate(data?: any) {
        let modal = this.dialog.open(CreateClassifiers, { data });

        let subModal = modal.componentInstance.close.subscribe(() => {
            modal.close();
            subModal.unsubscribe();
        })
    }

    openOption(data: any) {
        let modal = this.dialog.open(AddOptionModal, { data: { ...data, isChild: false } });

        let subModal = modal.componentInstance.close.subscribe(() => {
            modal.close();
            subModal.unsubscribe();
        })
    }
}