import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common';
import { TableComponent } from '@components';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ClassifierService } from '@services';
import { Observable, from } from 'rxjs';
import { find, map, mergeMap, tap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { AddOptionModal } from '@modals';

@Component({
    selector: 'app-details',
    templateUrl: './details.component.html',
    standalone: true,
    imports: [CommonModule, MatDialogModule, TableComponent],
})
export class DetailsComponent implements OnInit {
    tableContent = [{ key: 'clvanuid', name: 'ID' }, { key: 'clvadesc', name: 'Descripción' }, { key: 'clvastat', name: 'Estado' }, { key: 'underBy', name: 'Debajo de' }, { key: 'classifiersChildActions', name: 'Acciones' }]
    childs$!: Observable<any>
    constructor(private _classifiers: ClassifierService, private route: ActivatedRoute, private dialog: MatDialog, private router: Router) { }

    ngOnInit() {
        let { id } = this.route.snapshot.params;

        this.childs$ = this._classifiers.getChilds(id);
    }

    actions(event: { type: string, data: any }) {
        if (['Edit'].includes(event.type)) {
            this.openModal(event.data);
        }
    }

    openModal(data: any) {
        let modal = this.dialog.open(AddOptionModal, { data: { ...data, isChild: true } })

        let subModal = modal.componentInstance.close.subscribe(() => {
            modal.close();
            subModal.unsubscribe();
        })
    }
    goBack(){
        this.router.navigateByUrl("app/clasificadores")
    }
}