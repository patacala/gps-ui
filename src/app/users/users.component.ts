import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { UserModal } from '../components/modals/user/user.modal';
import { TableComponent } from '../components/table/table.component';
import { UserService } from '../services/user/user.service';
import { Observable } from 'rxjs';
import { ICompany } from '../services/company/company.interfaces';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  imports: [CommonModule, MatDialogModule, TableComponent],
  standalone: true
})
export class UsersComponent implements OnInit {
  tableContent = [{ key: 'usernuid', name: 'ID' }, { key: 'fullname', name: 'Usuario' }, { key: 'rol', name: 'Roles' }, { key: 'entityUser.enusstat', name: 'Estado' }, { key: 'action', name: 'Acción' }]
  users$!: Observable<any>
  constructor(private dialog: MatDialog, private _users: UserService) { }

  ngOnInit(): void {
    this.users$ = this._users.getUsers()
  }

  openCreateUser(data?: any): void {
    let modalRef = this.dialog.open(UserModal, { width: '700px', data });

    let modalCloseSub = modalRef.componentInstance.close.subscribe(() => {
      modalRef.close();
      modalCloseSub.unsubscribe();
    });
  }

  actionEvents(event: { type: string, data: ICompany }) {
    if (event.type === 'Edit') {
      return this.openCreateUser(event.data)
    }
    // @ts-ignore
    this._users.deleteUser(event.data.usernuid).subscribe(console.log)
  }
}