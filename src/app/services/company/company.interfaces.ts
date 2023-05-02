import { FormControl } from "@angular/forms"

export interface ICompanyCreate {
    "docType": FormControl<TDocType>,
    "docId": FormControl<string>,
    "description": FormControl<string>,
    "email": FormControl<string>,
    "phone": FormControl<string>,
    "file": FormControl<string>
}
export interface ICompany {
    "id": number,
    "docType": string,
    "docId": string,
    "description": string,
    "email": string,
    "phone": string,
    "type": string,
    "logo": string,
    "isActive": boolean,
    "isMultipleDevice": boolean,
    "canSeeMap": boolean,
    "createdAt": string,
    "updatedAt": string
}

export interface IResponseCompany { 
    status: boolean
    data: ICompany
}
export type TDocType = 'CEDULA' | 'NIT' | 'PASAPORTE' | 'CEDULA DE EXTRANJERÍA'