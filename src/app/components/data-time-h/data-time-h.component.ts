import { Component, Inject, OnInit } from '@angular/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe, NgIf } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ButtonComponent } from '../button/button.component';
import { ClassifierService } from 'src/app/services/classifiers/classifiers.service';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { DeviceService } from '@services';

@Component({
  selector: 'app-data-time-h',
  standalone: true,
  imports: [
    MatFormFieldModule, MatDatepickerModule, 
    MatNativeDateModule, FormsModule, 
    ReactiveFormsModule, DatePipe, 
    MatIconModule, ButtonComponent,
    MatDialogModule, NgIf
  ],
  templateUrl: './data-time-h.component.html',
  styleUrls: ['./data-time-h.component.scss']
})
export class DataTimeHComponent implements OnInit {
  formDates = new FormGroup({
     startDate: new FormControl<Date | null>(null, Validators.required),
     endDate: new FormControl<Date | null>(null, Validators.required),
 });
 
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _device: DeviceService,
    private _classifier: ClassifierService, 
  ) {}

  ngOnInit(): void {}

  searchHistoryDv() {
    if (typeof(this.data.deviceId) !== undefined) {
      const deviceId = this.data.deviceId;
      const filterDataDv = {
        classifiers: [-1],
        deviceIds: [deviceId],
        date: {
          startDate: this.formDates.value.startDate?.toISOString().slice(0, 10),
          endDate: this.formDates.value.endDate?.toISOString().slice(0, 10)
        },
        isAlarm: false 
      }; 

      this._classifier.filterByClassifier(filterDataDv).subscribe((histoyDevice: any) => {
          this._device.setHistoryLoc(histoyDevice.response);
      });
    }
  }
}
