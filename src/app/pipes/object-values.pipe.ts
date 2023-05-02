import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: 'tableValue',
    standalone: true
})
export class ObjectValues implements PipeTransform {

    getValue(key: string, object: any) {
        return key.split('.').reduce((obj, prop) => {
            if (obj && obj[prop] == '') return undefined;

            return obj && obj[prop];
        }, object);
    }
    transform(value: any, args: any) {
        if(['carrdevi.device.deviimei'].includes(args) && !this.getValue(args, value)) return 'Sin Asignar';

        return this.getValue(args, value)
    }
}