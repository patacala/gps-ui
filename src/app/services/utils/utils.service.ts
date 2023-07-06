import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {

  constructor() {}
  
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
}
