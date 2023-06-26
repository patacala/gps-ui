import { Component, OnInit } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { HistoryLoc } from './table-history.model';

@Component({
  selector: 'app-table-history',
  standalone: true,
  imports: [MatTableModule],
  templateUrl: './table-history.component.html',
  styleUrls: ['./table-history.component.scss']
})
export class TableHistoryComponent implements OnInit {
  devicesTable: HistoryLoc[]=[];
  dataSource = new MatTableDataSource<HistoryLoc>([]);
  displayedColumns: string[] = ['dloclati', 'dloclong', 'dspeed', 'delotime', 'delofesi'];
  
  constructor() { }

  ngOnInit(): void {
    this.dataSource.data = [];
  }

}
