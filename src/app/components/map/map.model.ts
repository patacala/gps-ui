export interface Device {
    devinuid: number,
    deviimei: string;
    carrlice: string;
}

export interface LocationData {
    IMEI: string;
    MARCA: string;
    MODELO: string;
    CELULAR: string;
    PLACA: string;
    "TIPO VEHICULO": string;
    LATITUD: string;
    LONGITUD: string;
    "FECHA SISTEMA": string;
    "FECHA REAL": string;
    VELOCIDAD: string
}