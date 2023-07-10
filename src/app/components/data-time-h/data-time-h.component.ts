import { Component, Inject, OnInit } from '@angular/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe, NgIf } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ButtonComponent } from '../button/button.component';
import { ClassifierService } from 'src/app/services/classifiers/classifiers.service';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DeviceService } from '@services';
import { UtilsService } from 'src/app/services/utils/utils.service';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';

@Component({
  selector: 'app-data-time-h',
  standalone: true,
  imports: [
    MatFormFieldModule, MatDatepickerModule, 
    MatNativeDateModule, FormsModule, 
    ReactiveFormsModule, DatePipe, 
    MatIconModule, ButtonComponent,
    MatDialogModule, NgIf, NgxMaterialTimepickerModule
  ],
  templateUrl: './data-time-h.component.html',
  styleUrls: ['./data-time-h.component.scss']
})
export class DataTimeHComponent implements OnInit {
  formDates = {
    startDate: new Date(),
    endDate: new Date(),
    startTime: '1:00 PM',
    endTime: '3:00 PM'
  };
  maxDate: string = '';
  
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<DataTimeHComponent>,
    private _device: DeviceService,
    private _classifier: ClassifierService, 
    private _utils: UtilsService
  ) {}

  ngOnInit(): void {
    this.maxDate = this._utils.getCurrentDateTime();
  }

  searchHistoryDv() {
    console.log(this.formDates);
    if (typeof(this.data.deviceId) !== undefined) {
      const deviceId = this.data.deviceId;
      const filterDataDv = {
        classifiers: [],
        deviceIds: [deviceId],
        date: {
          startDate: this.formDates.startDate?.toISOString().slice(0, 10),
          endDate: this.formDates.endDate?.toISOString().slice(0, 10)
        },
        isAlarm: false 
      }; 

      this._classifier.filterByClassifier(filterDataDv).subscribe((histoyDevice: any) => {
          if (typeof(histoyDevice.response) !== undefined) {
            if (histoyDevice.response.length > 0) {
              this.dialogRef.close();
              this._device.setHistoryLoc(deviceId, histoyDevice.response);
            }
          }
      });
    }
  }
}
