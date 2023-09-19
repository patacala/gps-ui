import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatNativeDateModule, ThemePalette } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { ButtonComponent } from '../button/button.component';
import { ClassifierService } from 'src/app/services/classifiers/classifiers.service';
import { map } from 'rxjs';
import { DialogRef } from '@angular/cdk/dialog';
import { MatIconModule } from '@angular/material/icon';
import { KmTraveled, LocationData, TimesData } from '../map/map.model';
import { UtilsService } from 'src/app/services/utils/utils.service';

@Component({
  selector: 'app-downloads-csv',
  standalone: true,
  imports: [
    FormsModule, ReactiveFormsModule,
    MatInputModule, MatSlideToggleModule,
    MatDatepickerModule, MatNativeDateModule,
    DatePipe, MatFormFieldModule, MatSelectModule, NgIf,
    NgForOf, ButtonComponent, MatIconModule
  ],
  providers: [DatePipe],
  templateUrl: './downloads-csv.component.html',
  styleUrls: ['./downloads-csv.component.scss']
})

export class DownloadsCsvComponent implements OnInit {
  maxDate: string = '';
  formFilter = new FormGroup({
     startDateOnly: new FormControl<Date | null>(new Date(), Validators.required),
     endDateOnly: new FormControl<Date | null>(new Date(), Validators.required),
     isLocation: new FormControl<Boolean | true>(true),
     isEvent: new FormControl<Boolean | false>(false),
     withAlert: new FormControl<Boolean | false>(false),
     typeReport: new FormControl<Number | -1>(3, Validators.required)
 });
 color: ThemePalette = 'primary';
 devicesFound!: Array<any>;
 classifiers!: Array<any>;
 typeCsvReports: any[] = [
    {
      tCsvRrtId: 1,
      tCsvRrtText: 'Estado actual',
      tCsvRrtSlide: false
    },
    {
      tCsvRrtId: 2,
      tCsvRrtText: 'Ultima posición',
      tCsvRrtSlide: false
    },
    {
      tCsvRrtId: 3,
      tCsvRrtText: 'Historico',
      tCsvRrtSlide: true
    }
  ];
  hiddenSlideToggle: boolean = true;
  devicesRTimes: TimesData[]=[];
  devicesRPross: [LocationData[], KmTraveled[]]=[[],[]];
  devicesFilter: LocationData[]=[];
  kmTraveled: KmTraveled[]=[];
  
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: DialogRef<DownloadsCsvComponent>,
    private _classifier: ClassifierService,
    private _utils: UtilsService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.devicesFound = this.data?.devicesFound;
    this.classifiers = this.data?.classifiers;
    this.resetFormFilter();
    this.maxDate = this._utils.getCurrentDateTime();
  }

  selectTypeReport(typeRptIndex: number) {
    if (typeRptIndex === 3) {
      this.hiddenSlideToggle = true;
    } else {
      this.hiddenSlideToggle = false;
    }
  }

  resetFormFilter() {
    this.formFilter.reset({
        startDateOnly: this._utils.currentDate(),
        endDateOnly: this._utils.currentDate(),
        isLocation: true,
        isEvent: false,
        withAlert: false,
        typeReport: 3
    });
  }

  filterDevsCsv() {
    const filterDataReport = {
        classifiers: this.classifiers, 
        deviceIds: this.devicesFound,
        isLocation: this.formFilter.value.isLocation,
        isEvent: this.formFilter.value.isEvent,
        isAlarm: this.formFilter.value.isEvent,
        date: {
            startDate: this.formFilter.value.startDateOnly?.toISOString().slice(0, 10),
            endDate: this.formFilter.value.endDateOnly?.toISOString().slice(0, 10)
        },
        typeReport: this.formFilter.value.typeReport
    };

    this._classifier.filterByClassifier(filterDataReport).pipe(
        map((devices: any) => devices.response)
    ).subscribe((devices: any) => {
        if (devices) {
            const typeReport = this.formFilter.value.typeReport;
            
            if (typeReport === 1) {
              this.devicesRTimes = this.processFilterDataTimes(devices);
              this.saveDataInCSV([
                {name:'estado actual', data: this.devicesRTimes},
              ]);
            }

            if (typeReport === 2 || typeReport === 3) {
              this.devicesRPross = this.processFilterData(devices); 
              if (typeReport === 2) {
                this.saveDataInCSV([
                  {name:'ultima posicion', data: this.devicesRPross[0]},
                ]);
              }
  
              if (typeReport === 3) {
                this.saveDataInCSV([
                  {name:'dispositivos', data: this.devicesRPross[0]},
                  {name:'kilometros recorridos', data: this.devicesRPross[1]}
                ]);
              }
          }
        }
    });
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

  processFilterData(datas: any): [LocationData[], KmTraveled[]] {
    const newLocData: LocationData[] = [];
    const newKmTraveled: KmTraveled[] = [];

    const mappedLocData = datas?.map((data:any) => ({
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
    
    const mappedKmTraveled = datas?.map((data:any) => ({
        deviimei: data.deviimei,
        devimark: data.devimark,
        devimode: data.devimode,
        deviphon: data.deviphon,
        carrlice: data.carrdevi?.carrier?.carrlice,
        carrtype: data.carrdevi?.carrier?.carrtype,
        kmTraveled: {
            kmdiacapt: data.kmdevi.map((km: any) => km.kmdiacapt),
            kmcapt: data.kmdevi.map((km: any) => km.kmcapt)
        }
    }));

    mappedLocData?.forEach((row: any) => {
        const locations = row.locations;
        locations.delolati.forEach((lat: any, index: number) => {
            newLocData.push({
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

    mappedKmTraveled?.forEach((row: any) => {
        const kmTraveled = row.kmTraveled;
        kmTraveled.kmdiacapt.forEach((kmDayCapt: any, index: number) => {
            newKmTraveled.push({
                IMEI: row.deviimei,
                MARCA: row.devimark,
                MODELO: row.devimode,
                CELULAR: row.deviphon,
                PLACA: row.carrlice,
                "TIPO VEHICULO": row.carrtype,
                "KM DÍA": kmDayCapt,
                "KM GENERADO": kmTraveled.kmcapt[index]
            });
        });
    });

    return [newLocData, newKmTraveled];  
  }

  processFilterDataTimes(datas: any): TimesData[] {
    const newTimes: TimesData[] = [];

    datas?.forEach((data: any) => {
      const imei = data.deviimei;
      const marca = data.devimark;
      const modelo = data.devimode;
      const celular = data.deviphon;
      const placa = data.carrdevi?.carrier?.carrlice;
      const tipoVehiculo = data.carrdevi?.carrier?.carrtype;
      const regTime = {date: '', hours: '', minutes: '', seconds: ''};

      const timeOperation = data.times.timeOperation[0] || regTime;
      const timeRalenti = data.times.timeRalenti[0] || regTime;
      const timeMovement = data.times.timeMovement[0] || regTime;

      if (timeOperation) {
          newTimes.push({
              IMEI: imei,
              MARCA: marca,
              MODELO: modelo,
              CELULAR: celular,
              PLACA: placa,
              "TIPO VEHICULO": tipoVehiculo,
              "TIPO DE TIEMPO": 'Tiempo de operación',
              FECHA: timeOperation.date || '',
              HORA: timeOperation.hours || '',
              MINUTO: timeOperation.minutes || '',
              SEGUNDO: timeOperation.seconds || ''
          });
      }

      if (timeRalenti) {
          newTimes.push({
              IMEI: imei,
              MARCA: marca,
              MODELO: modelo,
              CELULAR: celular,
              PLACA: placa,
              "TIPO VEHICULO": tipoVehiculo,
              "TIPO DE TIEMPO": 'Tiempo de relenti',
              FECHA: timeRalenti.date || '',
              HORA: timeRalenti.hours || '',
              MINUTO: timeRalenti.minutes || '',
              SEGUNDO: timeRalenti.seconds || ''
          });
      }

      if (timeMovement) {
          newTimes.push({
              IMEI: imei,
              MARCA: marca,
              MODELO: modelo,
              CELULAR: celular,
              PLACA: placa,
              "TIPO VEHICULO": tipoVehiculo,
              "TIPO DE TIEMPO": 'Tiempo de movimiento',
              FECHA: timeMovement.date || '',
              HORA: timeMovement.hours || '',
              MINUTO: timeMovement.minutes || '',
              SEGUNDO: timeMovement.seconds || ''
          });
      }
  });

  return newTimes;
  }

  // Exportar .csv
  saveDataInCSV(sheets: { name: string, data: any[] }[]): void {
    sheets.forEach(sheet => {
      this._utils.saveDataInCSV(sheet.name, sheet.data);
    });
  }

  closeToggle() {
    this.dialogRef.close();
  }
}
