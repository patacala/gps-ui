import { Component, Inject, OnInit } from '@angular/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, ThemePalette } from '@angular/material/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe, NgIf } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ButtonComponent } from '../button/button.component';
import { ClassifierService } from 'src/app/services/classifiers/classifiers.service';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DeviceService, MapService } from '@services';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { LoadAllComponent } from '../load-all/load-all.component';
import { LoadService } from 'src/app/services/load/load.service';

@Component({
  selector: 'app-data-time-h',
  standalone: true,
  imports: [
    MatFormFieldModule, MatDatepickerModule, 
    MatNativeDateModule, FormsModule, 
    ReactiveFormsModule, DatePipe, 
    MatIconModule, ButtonComponent,
    MatDialogModule, NgIf, NgxMaterialTimepickerModule,
    MatSlideToggleModule, LoadAllComponent
  ],
  templateUrl: './data-time-h.component.html',
  styleUrls: ['./data-time-h.component.scss']
})
export class DataTimeHComponent implements OnInit {
  formDates = {
    startDate: new Date(),
    endDate: new Date(),
    startTime: '',
    endTime: ''
  };
  slideToggle = {
    isLocation: true,
    isEvent: false, 
  };

  maxDate: string = '';
  color: ThemePalette = 'primary';
  sizeLevel: number = 0;
  
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<DataTimeHComponent>,
    private _map: MapService,
    private _device: DeviceService,
    private _classifier: ClassifierService, 
    private _utils: UtilsService,
    private _loadService: LoadService
  ) {}

  ngOnInit(): void {
    this.formDates.startDate = this._utils.currentDate();
    this.formDates.endDate = this._utils.currentDate();

    this.formDates.startTime = this._utils.getDelayedShortTmNow(60);
    this.formDates.endTime = this._utils.getCurrentTimeShort();
    this.maxDate = this._utils.getCurrentDateTime();

    this.getHiddenListHisto();
  }

  getHiddenListHisto() {
    this._map.getHiddenListHisto().subscribe((val: any) => {
        this.sizeLevel = val?.sizeControl;
    });
  }

  searchHistoryDv() {
    if (typeof(this.data.deviceId) !== undefined) {
      const deviceId = this.data.deviceId;
      const filterDataDv = {
        classifiers: [],
        deviceIds: [deviceId],
        date: {
          startDate: this.applyTimeDate(this.formDates.startDate, this.formDates.startTime),
          endDate: this.applyTimeDate(this.formDates.endDate, this.formDates.endTime)
        },
        isAlarm: this.slideToggle.isEvent,
        isLocation: this.slideToggle.isLocation,
        isEvent: this.slideToggle.isEvent,
        typeReport: 3
      }; 

      this._loadService.setActiveBtnLoad('searchHistoryDv');
      this._classifier.filterByClassifier(filterDataDv).subscribe((histoyDevice: any) => {
          const resultHistoryDevs = histoyDevice?.response[0]?.locations;
          const plate = histoyDevice?.response[0]?.carrdevi?.carrier?.carrlice;
          const imei = histoyDevice?.response[0]?.deviimei;
          const phone = histoyDevice?.response[0].deviphon;
    
          if (typeof(resultHistoryDevs) !== undefined 
          && typeof(plate) !== undefined && typeof(imei) !== undefined 
          && typeof(phone) !== undefined) {

            const deviInfoObject = {plate, imei, phone};
            if (resultHistoryDevs?.length > 0) {
              resultHistoryDevs.deviInfoObject  = deviInfoObject;
              this._device.setHistoryLoc(deviceId, filterDataDv, resultHistoryDevs);
              this._map.hiddenIconLHisto(true);
              this._map.hiddenListHisto({hiddenListHisto: false, sizeControl: this.sizeLevel});
              this.dialogRef.close();
            } else {
              this._utils.matSnackBar('Sin resultados', 'ok');
            }
            
          } else {
            this._utils.matSnackBar('Problema para mostrar historial', 'ok');
          }

          this._loadService.clearActiveBtnLoad();
      });
    }
  }

  applyTimeDate(date: Date, time: string) {
    const dateOnly = date.toISOString().slice(0, 10);
    const timeOnly = this._utils.getTransformTime(time);
    return dateOnly.concat(' ', timeOnly);
  }

  dialogClose() {
    this.dialogRef.close();
  }

  getBtnLoadActive(nameBtnLoad: string) {
    const currentNameBtnLoad = this._loadService.getActiveBtnLoad();
    if (nameBtnLoad === currentNameBtnLoad) return true;
    return false;
  }
}
