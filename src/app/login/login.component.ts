import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonComponent, InputComponent } from '@components';
import { AuthService, IUserForm } from '@services';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { NgForOf } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [RouterModule, InputComponent, ButtonComponent, ReactiveFormsModule, FormsModule, MatDialogModule, NgForOf, MatSelectModule]
})
export class LoginComponent implements OnInit {
  @ViewChild('selectEntitites') selectEntities!: TemplateRef<any>
  public logGroup!: FormGroup;
  constructor(private fb: FormBuilder, private _auth: AuthService, private router: Router, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.logGroup = this._INIT_FORM
  }

  get _INIT_FORM(): FormGroup {
    return this.fb.group<IUserForm>({
      username: this.fb.nonNullable.control(''),
      password: this.fb.nonNullable.control('')
    })
  }

  selectEntity(entity: string | any) {
    localStorage.setItem('entity', JSON.stringify(entity));
  }

  goToApp() {
    let isSuperAdmin = JSON.parse(localStorage.getItem('isSuperAdmin') as string) == 1;

    this.dialog.closeAll()
    this.router.navigate([!isSuperAdmin ? '/app' : '/app/entidades']);
  }

  logIn(): void {
    const userCredentials = this.logGroup.getRawValue();

    let logSub = this._auth.logIn(userCredentials).subscribe((result) => {
      localStorage.setItem('token', result.token);
      localStorage.setItem('fullname', result.user.fullname);
      localStorage.setItem('isSuperAdmin', result.user.usersupe);
      if (result.entities.length > 1) {
        this.dialog.open(this.selectEntities, { data: result.entities });
        logSub.unsubscribe()
        return;
      }
      if(result.entities[0]) this.selectEntity(result.entities[0]);
      
      this.goToApp()
      logSub.unsubscribe()
    })
  }
}
// francisco@mail.com
// u1hqp3ea

//carlos@mail.com pass: e15hl1r3