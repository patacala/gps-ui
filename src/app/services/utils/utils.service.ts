import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor() { }
  
  saveDataInCSV(data: Array<any>): string {
    if (data.length == 0) {
      return '';
    }

    let propertyNames = Object.keys(data[0]);
    let rowWithPropertyNames = propertyNames.join(',') + '\n';

    let csvContent = rowWithPropertyNames;

    let rows: string[] = [];

    data.forEach((item) => {
      let values: string[] = [];

      propertyNames.forEach((key) => {
        let val: any = item[key];

        if (val !== undefined && val !== null) {
          // Verifica el tipo de dato y realiza la conversión correspondiente
          if (typeof val === 'string' || val instanceof String) {
            val = new String(val);
          } else if (typeof val === 'number' || val instanceof Number) {
            val = new Number(val);
          } else if (typeof val === 'boolean' || val instanceof Boolean) {
            val = val.toString();
          } else if (val instanceof Date) { // Comprueba si el valor es de tipo Date
            val = val.toISOString(); // Convierte la fecha a formato ISO
          } else {
            // Otros tipos de datos que no apliquen a las condicionales anterior
            val = '';
          }
        } else {
          val = '';
        }
        values.push(val);
      });
      rows.push(values.join(','));
    });
    csvContent += rows.join('\n');

    return csvContent;
  }
}
