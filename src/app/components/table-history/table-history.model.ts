export interface HistoryLoc {
    delonuid: number,
    delolati: number;
    delolong: number;
    delodire: string;
    delobarri: string;
    delospee: string;
    delotime: string;
    delofesi: string;
    keywfunc: string;
    deloacc: string;
    delodoor: string;
}

export interface HistoryData {
    LATITUD: string;
    LONGITUD: string;
    DIRECCION: string;
    BARRIO: string;
    EVENTO: string;
    "FECHA SISTEMA": string;
    "FECHA REGISTRO": string;
    VELOCIDAD: string
}

export interface HistoryData2 {
    IMEI: string;
    PLACA: string;
    CELULAR: string;
    'FECHA GPS': string;
    ACC: string;
    PUERTA: string;
    EVENTO: string;
    VELOCIDAD: string;
    DIRECCION: string;
    'FECHA SISTEMA': string;
}