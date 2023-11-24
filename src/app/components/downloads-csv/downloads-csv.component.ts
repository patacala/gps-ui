import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { LoadService } from 'src/app/services/load/load.service';
import { LoadAllComponent } from '../load-all/load-all.component';

@Component({
  selector: 'app-downloads-csv',
  standalone: true,
  imports: [
    FormsModule, ReactiveFormsModule,
    MatInputModule, MatSlideToggleModule,
    MatDatepickerModule, MatNativeDateModule,
    DatePipe, MatFormFieldModule, MatSelectModule, NgIf,
    NgForOf, ButtonComponent, MatIconModule,
    NgxMaterialTimepickerModule, LoadAllComponent
  ],
  providers: [DatePipe],
  templateUrl: './downloads-csv.component.html',
  styleUrls: ['./downloads-csv.component.scss']
})

export class DownloadsCsvComponent implements OnInit {
  maxDate: string = '';
  formFilter = {
    startDateOnly: new Date(),
    endDateOnly: new Date(),
    startTime: '',
    endTime: '',
    isLocation: true,
    isEvent: false,
    withAlert: false,
    typeReport: 3
  };

 color: ThemePalette = 'primary';
 devicesFound!: Array<any>;
 classifiers!: Array<any>;
 typeCsvReports: any[] = [
    /* {
      tCsvRrtId: 1,
      tCsvRrtText: 'Estado actual',
      tCsvRrtSlide: false
    }, */
    {
      tCsvRrtId: 2,
      tCsvRrtText: 'Ultima posición',
      tCsvRrtSlide: false
    },
    {
      tCsvRrtId: 3,
      tCsvRrtText: 'Historico',
      tCsvRrtSlide: true
    },
    {
      tCsvRrtId: 4,
      tCsvRrtText: 'Kilometros por días',
      tCsvRrtSlide: false
    },
    {
      tCsvRrtId: 5,
      tCsvRrtText: 'Kilometraje por días y tiempo',
      tCsvRrtSlide: false
    }
  ];

  noHiddenSlideToggle: boolean = true;
  noHiddenDates: boolean = true;
  noHiddenTimeReg: boolean = true;
  devicesRTimes: TimesData[]=[];
  devicesRPross: LocationData[]=[];
  devicesFilter: LocationData[]=[];
  kmTraveled: KmTraveled[]=[];
  
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: DialogRef<DownloadsCsvComponent>,
    private _classifier: ClassifierService,
    private _utils: UtilsService,
    private _loadService: LoadService,
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
      this.noHiddenSlideToggle = true;
    } else {
      this.noHiddenSlideToggle = false;
    }

    if (typeRptIndex === 3 || typeRptIndex === 5) {
      this.noHiddenTimeReg = true;
    } else {
      this.noHiddenTimeReg = false;
    }

    if (typeRptIndex === 2) {
      this.noHiddenDates = false;
    } else {
      this.noHiddenDates = true;
    }
  }

  resetFormFilter() {
    this.formFilter = {
      startDateOnly: this._utils.currentDate(),
      endDateOnly: this._utils.currentDate(),
      startTime: this._utils.getDelayedShortTmNow(60),
      endTime: this._utils.getCurrentTimeShort(),
      isLocation: true,
      isEvent: false,
      withAlert: false,
      typeReport: 3
    };
  }

  filterDevsCsv() {
    let typeReport = this.formFilter.typeReport;
    let date = {startDate: '', endDate: ''};

    if (typeReport === 1 || typeReport === 2 || typeReport === 4) {
      date = {
        startDate: this.formFilter.startDateOnly?.toISOString().slice(0, 10),
        endDate: this.formFilter.endDateOnly?.toISOString().slice(0, 10)
      }
    } else {
      date = {
        startDate: this.applyTimeDate(this.formFilter.startDateOnly, this.formFilter.startTime),
        endDate: this.applyTimeDate(this.formFilter.endDateOnly, this.formFilter.endTime)
      }

      if (typeReport === 5) {
        typeReport = 4;
      }
    }

    const filterDataReport = {
        classifiers: this.classifiers, 
        deviceIds: this.devicesFound,
        isLocation: this.formFilter.isLocation,
        isEvent: this.formFilter.isEvent,
        isAlarm: this.formFilter.isEvent,
        date,
        typeReport
    };

    this._loadService.setActiveBtnLoad('filterDevsCsv');
    this._classifier.filterByClassifier(filterDataReport).pipe(
        map((devices: any) => devices.response)
    ).subscribe((devices: any) => {
      this._loadService.clearActiveBtnLoad();

      if (devices) {
          const typeReport = this.formFilter.typeReport;
          
          if (typeReport === 1) {
            this.devicesRTimes = this.processFilterDataTimes(devices, date?.startDate, date?.endDate);
            this.saveDataInCSV([
              {name:`estado actual ${date?.startDate} - ${date?.endDate}`, data: this.devicesRTimes},
            ]);
          }

          if (typeReport === 2 || typeReport === 3) {
            this.devicesRPross = this.processFilterData(devices); 
            if (typeReport === 2) {
              this.saveDataInCSV([
                {name:'ultima posicion', data: this.devicesRPross},
              ]);
            }

            if (typeReport === 3) {
              this.saveDataInCSV([
                {name:`historial ${date?.startDate} - ${date?.endDate}`, data: this.devicesRPross}
              ]);
            }
          }

          if (typeReport === 4 || typeReport === 5) {
            this.kmTraveled = this.processFilterDtKmTrav(devices, date?.startDate, date?.endDate);

            if (typeReport === 4) {
              this.saveDataInCSV([
                {name:`Kilometros recorridos días ${date?.startDate} - ${date?.endDate}`, data: this.kmTraveled},
              ]);
            }

            if (typeReport === 5) {
              this.saveDataInCSV([
                {name: `Kilometros recorridos días y tiempo ${date?.startDate} - ${date?.endDate}`, data: this.kmTraveled},
              ]);
            }
          }
      }
    });
  }

  applyTimeDate(date: Date, time: string) {
    const dateOnly = date.toISOString().slice(0, 10);
    const timeOnly = this._utils.getTransformTime(time);
    return dateOnly.concat(' ', timeOnly);
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

  processFilterData(datas: any): LocationData[] {
    const newLocData: LocationData[] = [];
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

    return newLocData;  
  }

  processFilterDtKmTrav(datas: any, startDate: string, endDate: string): KmTraveled[] {
    const newKmTraveled: KmTraveled[] = [];
    const rangeDate = this.generateDateRange(startDate, endDate);
  
    datas?.forEach((data: any) => {
      const regTime = { date: '', hours: '', minutes: '', seconds: '' };
      rangeDate.forEach((day: any) => {
        const timeOperation = data?.times?.timeOperation.find((time: any) => time.date == day);
        const timeRalenti = data?.times?.timeRalenti.find((time: any) => time.date == day);
        const timeMovement = data?.times?.timeMovement.find((time: any) => time.date == day);

        newKmTraveled.push({
          IMEI: data.deviimei,
          MARCA: data.devimark,
          MODELO: data.devimode,
          CELULAR: data.deviphon,
          PLACA: data.carrdevi?.carrier?.carrlice || '',
          "TIPO VEHICULO": data.carrdevi?.carrier?.carrtype || '',
          "KM FECHA": day,
          "KM GENERADO": data.kmTotalPerDay[data.kmTotalPerDay.findIndex((km: any) => km?.date == day)]?.value || 0,
          "TIEMPO DE OPERACION": timeOperation ? this.formatTime(timeOperation) : this.formatTime(regTime),
          "TIEMPO DE RELENTI": timeRalenti ? this.formatTime(timeRalenti) : this.formatTime(regTime),
          "TIEMPO DE MOVIMIENTO": timeMovement ? this.formatTime(timeMovement) : this.formatTime(regTime),
        });
      });
    });
  
    return newKmTraveled;
  }
  
  processFilterDataTimes(datas: any, startDate: string, endDate: string): TimesData[] {
    const newTimes: TimesData[] = [];
    const rangeDate = this.generateDateRange(startDate, endDate);
  
    datas?.forEach((data: any) => {
      const regTime = { date: '', hours: '', minutes: '', seconds: '' };
      rangeDate.forEach((day: any) => {
        console.log(day);
        const timeOperation = data?.times?.timeOperation.find((time: any) => time.date === day);
        const timeRalenti = data?.times?.timeRalenti.find((time: any) => time.date === day);
        const timeMovement = data?.times?.timeMovement.find((time: any) => time.date === day);
  
        newTimes.push({
          IMEI: data.deviimei,
          MARCA: data.devimark,
          MODELO: data.devimode,
          CELULAR: data.deviphon,
          PLACA: data.carrdevi?.carrier?.carrlice || '',
          "TIPO VEHICULO": data.carrdevi?.carrier?.carrtype || '',
          "FECHA": day,
          "TIEMPO DE OPERACION": timeOperation ? this.formatTime(timeOperation) : this.formatTime(regTime),
          "TIEMPO DE RELENTI": timeRalenti ? this.formatTime(timeRalenti) : this.formatTime(regTime),
          "TIEMPO DE MOVIMIENTO": timeMovement ? this.formatTime(timeMovement) : this.formatTime(regTime),
        });
      });
    });

    return newTimes;
  }

  generateDateRange(start: string, end: string) {
    const startDate = new Date(start);
    const endDate = new Date(end);
  
    const dates = [];
  
    let currentDate = startDate;
    while (currentDate <= endDate) {
      dates.push(currentDate.toISOString().slice(0, 10));
      currentDate.setDate(currentDate.getDate() + 1);
    }
  
    return dates;
  }

  formatTime(time: any) {
    if (!time.hours && !time.minutes && !time.seconds) {
      return '';
    }
  
    const parts = [];
  
    if (time.hours) {
      parts.push(time.hours + ' Horas');
    }
  
    if (time.minutes) {
      parts.push(time.minutes + ' Minutos');
    }
  
    if (time.seconds) {
      parts.push(time.seconds + ' Segundos');
    }
  
    return parts.join(' ');
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

  getBtnLoadActive(nameBtnLoad: string) {
    const currentNameBtnLoad = this._loadService.getActiveBtnLoad();
    if (nameBtnLoad === currentNameBtnLoad) return true;
    return false;
  }
}
