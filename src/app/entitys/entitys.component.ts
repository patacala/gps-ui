import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { ButtonComponent, ChipsComponent, SnackAlert, TableComponent } from '@components';
import { EntityModal } from '@modals';
import { CompanyService, ICompany } from '@services'
import { Observable } from 'rxjs';
@Component({
  selector: 'app-entitys',
  templateUrl: './entitys.component.html',
  imports: [CommonModule, TableComponent, MatDialogModule, ButtonComponent, ChipsComponent],
  standalone: true
})
export class EntitysComponent implements OnInit {
  tableContent = [{ key: 'entidesc', name: 'Entidad' }, { key: 'entimail', name: 'Email' }, /* { key: 'car', name: 'Vehículos registrados' }, */ { key: 'entistat', name: 'Estado' }, { key: 'action', name: 'Acción' }]
  company$!: Observable<any>;
  constructor(private dialog: MatDialog, private _company: CompanyService, private _snack: SnackAlert) { }

  ngOnInit(): void {
    this.company$ = this._company.getCompany()
  }

  openCreateUser(data?: ICompany): void {
    let modalRef = this.dialog.open(EntityModal, { width: '600px', data });

    let modalCloseSub = modalRef.componentInstance.close.subscribe(() => {
      modalRef.close();
      modalCloseSub.unsubscribe();
    });
  }

  deleteCompany(data: any): void {
    this._company.deleteCompany(data.entinuid).subscribe(() => {
      this._snack.showSuccess("La entidad ha sido elminada")
    })
  }

  actionsTable({ type, data }: { type: string, data: ICompany }): void {
    console.log(type, data)
    if (['Edit'].includes(type)) this.openCreateUser(data)
    if (['Delete'].includes(type)) this.deleteCompany(data)
  }
}
