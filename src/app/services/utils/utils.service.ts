import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor() { }
  
  saveDataInCSV(data: Array<any>): string {
    if (data.length === 0) {
      return '';
    }
  
    const flattenData: { key: string; value: any; }[] = [];
  
    // Función para aplanar un objeto recursivamente
    const flattenObject = (obj: { [x: string]: { toString: () => any; }; }, prefix = '') => {
      for (let key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          flattenObject(obj[key], prefix + key + '.');
        } else {
          flattenData.push({
            key: prefix + key,
            value: obj[key] !== null ? obj[key].toString() : ''
          });
        }
      }
    };
  
    data.forEach(item => flattenObject(item));
  
    const propertyNames = Array.from(new Set(flattenData.map(item => item.key)));
  
    let rowWithPropertyNames = propertyNames.join(',') + '\n';
    let csvContent = rowWithPropertyNames;
  
    const rows: string[] = [];
  
    data.forEach(item => {
      const values: string[] = [];
  
      propertyNames.forEach(key => {
        const matchedItem = flattenData.find(
          item => item.key === key
        );
  
        if (matchedItem) {
          values.push(matchedItem.value);
        } else {
          values.push('');
        }
      });
  
      rows.push(values.join(','));
    });
  
    csvContent += rows.join('\n');
  
    return csvContent;
  }  
}
