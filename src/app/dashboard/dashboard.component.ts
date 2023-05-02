import { Component, OnInit } from '@angular/core';
import { StatisticComponent } from '../components/statistic/statistic.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [StatisticComponent],
  standalone: true
})
export class DashboardComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
