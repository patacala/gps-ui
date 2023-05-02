import { AbstractControl, FormControl } from "@angular/forms"

export interface IUserLogIn {
    username: string,
    password: string
}

export interface IUserForm extends Record<keyof IUserLogIn, AbstractControl> {
    username: FormControl<string>;
    password: FormControl<string>
}
export interface IResetPassword {
    password: FormControl<string>
    newpassword: FormControl<string>
}