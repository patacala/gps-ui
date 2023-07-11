import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {

  constructor(
    private _snackBar: MatSnackBar
  ) {}
  
  saveDataInCSV(objects: any[]): string {
    if (objects.length === 0) {
      return '';
    }
  
    const propertyNames = Object.keys(objects[0]);
    const headerRow = propertyNames.join(',') + '\n';
  
    const rows = objects.map(obj => {
      const values = propertyNames.map(prop => {
        let value = obj[prop];
  
        // Convertir el valor al tipo de dato correcto
        if (typeof value === 'string') {
          value = '"' + value + '"';
        } else if (typeof value === 'boolean') {
          value = value ? 'true' : 'false';
        } else if (value instanceof Date) {
          value = value.toISOString();
        } else if (value === null || value === undefined) {
          value = '';
        }
  
        return value;
      });
  
      return values.join(',');
    });
  
    return headerRow + rows.join('\n');
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
