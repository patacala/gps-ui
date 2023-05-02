import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { InputComponent } from '../components/input/input.component';
import { AuthService, IResetPassword } from '@services';

@Component({
  selector: 'app-reset',
  templateUrl: './reset-password.component.html',
  standalone: true,
  imports: [RouterModule, InputComponent, ReactiveFormsModule, FormsModule]
})
export class ResetComponent implements OnInit {
  public logGroup!: FormGroup;
  constructor(private fb: FormBuilder, private _auth: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.logGroup = this._INIT_FORM
  }

  get _INIT_FORM(): FormGroup {
    return this.fb.group<IResetPassword>({
      newpassword: this.fb.nonNullable.control(''),
      password: this.fb.nonNullable.control('')
    })
  }

  logIn(): void {
    const userCredentials = this.logGroup.getRawValue();
    console.log(userCredentials)
    // let logSub = this._auth.logIn(userCredentials).subscribe(({ data }) => {
    //   localStorage.setItem('token', data.accessToken)
    //   this.router.navigate(['/app']);
    //   logSub.unsubscribe()
    // })
  }
}