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
import { DeviceService } from '@services';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-data-time-h',
  standalone: true,
  imports: [
    MatFormFieldModule, MatDatepickerModule, 
    MatNativeDateModule, FormsModule, 
    ReactiveFormsModule, DatePipe, 
    MatIconModule, ButtonComponent,
    MatDialogModule, NgIf, NgxMaterialTimepickerModule,
    MatSlideToggleModule
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
  
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<DataTimeHComponent>,
    private _device: DeviceService,
    private _classifier: ClassifierService, 
    private _utils: UtilsService
  ) {}

  ngOnInit(): void {
    this.formDates.startDate = this._utils.currentDate();
    this.formDates.endDate = this._utils.currentDate();

    this.formDates.startTime = this._utils.getDelayedShortTmNow(60);
    this.formDates.endTime = this._utils.getCurrentTimeShort();
    this.maxDate = this._utils.getCurrentDateTime();
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
        isEvent: this.slideToggle.isEvent
      }; 

      this._classifier.filterByClassifier(filterDataDv).subscribe((histoyDevice: any) => {
          const resultHistoryDevs = histoyDevice?.response[0]?.locations;
    
          if (typeof(resultHistoryDevs) !== undefined) {
            if (resultHistoryDevs?.length > 0) {
              this._device.setHistoryLoc(deviceId, filterDataDv, resultHistoryDevs);
              this.dialogRef.close();
            } else {
              this._utils.matSnackBar('Sin resultados', 'ok');
            }
          }
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
}
