import { Component, OnInit } from '@angular/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-data-time-h',
  standalone: true,
  imports: [
    MatFormFieldModule, MatDatepickerModule, 
    MatNativeDateModule, FormsModule, 
    ReactiveFormsModule, DatePipe, 
    MatIconModule, ButtonComponent
  ],
  templateUrl: './data-time-h.component.html',
  styleUrls: ['./data-time-h.component.scss']
})
export class DataTimeHComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
