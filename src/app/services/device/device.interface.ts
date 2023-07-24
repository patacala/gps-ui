export interface IDeviceResponse {
    "id": number,
    "company": {},
    "imei": string,
    "mark": string,
    "mode": string,
    "phone": string,
    "status": true,
    "createdAt": string,
    "updatedAt": string
}

export interface IDeviceCreate {
    "brand": string,
    "imei": string,
    "model": string,
    "phoneNumber": string
}

export interface ExecuteParamDv {
    "stepExec": number,
    "deviExec": number,
    "execParam": number,
}