export interface Device {
    devinuid: number,
    deviimei: string;
    carrlice: string;
    classdevi: any;
    check: boolean;
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
    DIRECCION: string;
    BARRIO: string;
    EVENTO: string;
    "FECHA SISTEMA": string;
    "FECHA REGISTRO": string;
    VELOCIDAD: string
}

export interface KmTraveled {
    IMEI: string;
    MARCA: string;
    MODELO: string;
    CELULAR: string;
    PLACA: string;
    "TIPO VEHICULO": string;
    "KM FECHA": string;
    "KM GENERADO": number;
    "TIEMPO DE OPERACION": any;
    "TIEMPO DE RELENTI": any;
    "TIEMPO DE MOVIMIENTO": any;
}

export interface TimesData {
    IMEI: string;
    MARCA: string;
    MODELO: string;
    CELULAR: string;
    PLACA: string;
    "TIPO VEHICULO": string;
    FECHA: string;
    "TIEMPO DE OPERACION": string;
    "TIEMPO DE RELENTI": string;
    "TIEMPO DE MOVIMIENTO": string;
}

  