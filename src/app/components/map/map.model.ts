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
    "KM DÍA": string;
    "KM GENERADO": number;
}

  