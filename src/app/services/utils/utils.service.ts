import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {

  constructor(
    private _snackBar: MatSnackBar,
  ) {}
  
  saveDataInCSV(name: string, objects: any[]) {
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
    const result =  bom + headerRow + rows.concat('\n');

    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(result);
    hiddenElement.target = '_blank';
    hiddenElement.download = name + '.csv';
    hiddenElement.click();
    return;
  }  

  saveDataInCSVWithSheets(name: string, sheets: { name: string, data: any[] }[]) {
    if (sheets.length === 0) {
      return '';
    }
  
    const bom = '\uFEFF';
    let result = '';
  
    sheets.forEach(sheet => {
      const objects = sheet.data;
      const propertyNames = Object.keys(objects[0]);
      const headerRow = propertyNames.join(';') + '\n';
  
      let rows = '';
      objects.forEach(obj => {
        let row = '';
  
        propertyNames.forEach(prop => {
          let value = obj[prop];
  
          if (typeof value === 'string') {
            value = '"' + value.replace(/[#]/g, 'N°') + '"';
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
  
      const sheetContent = headerRow + rows.concat('\n');
      result += bom + `[Hoja: ${sheet.name}]` + '\n' + sheetContent;
    });
  
    const hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(result);
    hiddenElement.target = '_blank';
    hiddenElement.download = `${name}.csv`;
    hiddenElement.click();
    return;
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
