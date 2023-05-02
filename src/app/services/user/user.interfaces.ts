import { AbstractControl, FormControl } from "@angular/forms";

export interface ICreateUser {
    username: string,
    fullname: string,
    password: string,
    role: TRoles,
}
export interface IFormCreate extends Record<keyof ICreateUser, AbstractControl> { 
    username: FormControl<string>;
    fullname: FormControl<string>,
    password: FormControl<string>,
    role: FormControl<TRoles>,
}
export type TRoles = "ADMIN-PRI" | "ADMIN-SEC" | "USER" | "SUP-ROOT";