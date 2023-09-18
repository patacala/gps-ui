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
  templateUrl: './downloads-csv.component.html',
  styleUrls: ['./downloads-csv.component.scss']
})
export class DownloadsCsvComponent implements OnInit {
  maxDate: string = '';
  formFilter = new FormGroup({
    /*  plate: new FormControl<String | null>(null), */
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
  
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: DialogRef<DownloadsCsvComponent>,
    private _classifier: ClassifierService,
  ) {}

  ngOnInit(): void {
    this.devicesFound = this.data?.devicesFound;
    this.classifiers = this.data?.classifiers;
  }

  selectTypeReport(typeRptIndex: number) {
    if (typeRptIndex === 3) {
      this.hiddenSlideToggle = true;
    } else {
      this.hiddenSlideToggle = false;
    }
  }

  filterDevsCsv() {
    const filterDataReport = {
        //classifiers: this.classifiers, 
        deviceIds: this.devicesFound.map(device => device.devinuid),
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
            console.log(devices);
        }
    });
  }

  closeToggle() {
    this.dialogRef.close();
  }
}
