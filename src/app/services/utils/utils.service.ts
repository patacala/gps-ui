import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LocationData } from 'src/app/components/map/map.model';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {

  constructor(
    private _snackBar: MatSnackBar,
    private datePipe: DatePipe
  ) {}
  
  saveDataInCSV(objects: any[]): string {
    if (objects.length === 0) {
      return '';
    }
  
    const propertyNames = Object.keys(objects[0]);
    const headerRow = propertyNames.join(';') + '\n';
    
    let rows = '';
    objects.forEach(obj => {
      let row = '';

      propertyNames.forEach(prop => {
        let value = obj[prop];
        
        if (typeof value === 'string') {
          value = '"' +value.replace(/[#]/g, 'N°')+ '"';
        } else if (typeof value === 'boolean') {
          value = value ? 'true' : 'false';
        } else if (value instanceof Date) {
          value = value.toISOString();
        } else if (value === null || value === undefined) {
          value = '';
        }
        
        row = row.concat(value, ';');
      });

      rows += row.concat('\n');
    });
    
    const bom = '\uFEFF';
    return bom + headerRow + rows.concat('\n');
  }  
  
  formatTimestamp(timestamp: string): string {
    const year = timestamp.slice(0, 2);
    const month = timestamp.slice(2, 4);
    const day = timestamp.slice(4, 6);
    const hour = timestamp.slice(6, 8);
    const min = timestamp.slice(8, 10);
    const sec = timestamp.slice(10, 12);

    const formattedDate = `20${year}-${month}-${day} ${hour}:${min}:${sec}`;
    const date = new Date(formattedDate);

    return this.datePipe.transform(date, 'yyyy-MM-dd HH:mm:ss') || '';
  }

  processFilterData(datas: any) {
    const newArray: LocationData[] = [];
    const mappedArray = datas?.map((data:any) => ({
        deviimei: data.deviimei,
        devimark: data.devimark,
        devimode: data.devimode,
        deviphon: data.deviphon,
        carrlice: data.carrdevi?.carrier?.carrlice,
        carrtype: data.carrdevi?.carrier?.carrtype,
        locations: {
            delolati: data.locations.map((loc: any) => loc.delolati),
            delolong: data.locations.map((loc: any) => loc.delolong),
            delodire: data.locations.map((loc: any) => loc.delodire),
            delobarri: data.locations.map((loc: any) => loc.delobarri),
            delofesi: data.locations.map((loc: any) => loc.delofesi),
            delotime: data.locations.map((loc: any) => loc.delotime),
            delospee: data.locations.map((loc: any) => loc.delospee),
            keywfunc: data.locations.map((loc: any) => loc.keywords.keywfunc),
        }
    }));  

    mappedArray?.forEach((row: any) => {
        const locations = row.locations;
        locations.delolati.forEach((lat: any, index: number) => {
            newArray.push({
                IMEI: row.deviimei,
                MARCA: row.devimark,
                MODELO: row.devimode,
                CELULAR: row.deviphon,
                PLACA: row.carrlice,
                "TIPO VEHICULO": row.carrtype,
                LATITUD: lat,
                LONGITUD: locations.delolong[index],
                DIRECCION: locations.delodire[index],
                BARRIO: locations.delobarri[index],
                EVENTO: locations.keywfunc[index],
                "FECHA SISTEMA": locations.delofesi[index],
                "FECHA REGISTRO": this.formatTimestamp(locations.delotime[index]),
                VELOCIDAD: locations.delospee[index],
            });
        });
    });
    return newArray;  
  }

  getCurrentDateTime() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const day = currentDate.getDate().toString().padStart(2, '0');
    const hours = currentDate.getHours().toString().padStart(2, '0');
    const minutes = currentDate.getMinutes().toString().padStart(2, '0');
    const seconds = currentDate.getSeconds().toString().padStart(2, '0');
  
    const currentDateOnly = `${year}-${month}-${day}`;
    const timeEnd = `${hours}:${minutes}:${seconds}`;
  
    return `${currentDateOnly}T${timeEnd}`;
  }
  
  getCurrentTimeShort() {
    const currentDate = new Date();
    const hours = currentDate.getHours();
    const minutes = currentDate.getMinutes();
    const amPm = hours >= 12 ? 'PM' : 'AM';
    const formattedTime = `${(hours % 12) || 12}:${minutes.toString().padStart(2, '0')} ${amPm}`;
    return formattedTime; // Ejemplo de salida: '3:00 PM'
  }

  getDelayedShortTmNow(delayMinutes: number) {
      const currentDate = new Date();
      currentDate.setMinutes(currentDate.getMinutes() - delayMinutes);
    
      const hours = currentDate.getHours();
      const minutes = currentDate.getMinutes();
      const amPm = hours >= 12 ? 'PM' : 'AM';
      const formattedTime = `${(hours % 12) || 12}:${minutes.toString().padStart(2, '0')} ${amPm}`;
      return formattedTime; // Ejemplo de salida: '3:00 PM'
  }
  
  getTransformTime(timeString: string) {
    const [timePart, amPmPart] = timeString.split(' ');
    const [hours, minutes] = timePart.split(':');

    let hour = parseInt(hours, 10);
    if (amPmPart === 'PM' && hour < 12) {
      hour += 12;
    } else if (amPmPart === 'AM' && hour === 12) {
      hour = 0;
    }

    const formattedTime = `${hour.toString().padStart(2, '0')}:${minutes}:00`;
    return formattedTime;
  }

  matSnackBar(message: string, action: string) {
    const snackBarRef = this._snackBar.open(message, action);
    setTimeout(() => {
      snackBarRef.dismiss();
    }, 2000);
  }
}
