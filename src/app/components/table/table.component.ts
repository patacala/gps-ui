import { Component, EventEmitter, Input, OnInit, Output, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { ButtonComponent, ChipsComponent } from '@components';
import { PermissionDirective } from 'src/app/directives/permission.directive';
import { ObjectValues } from 'src/app/pipes/object-values.pipe';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  standalone: true,
  imports: [MatTableModule, MatPaginatorModule, MatCheckboxModule, CommonModule, MatTooltipModule, ObjectValues,
    MatSortModule, MatIconModule, ButtonComponent, ChipsComponent, MatSlideToggleModule, PermissionDirective],
})
export class TableComponent implements OnInit, OnChanges {
  @Output('actions') actions: EventEmitter<{ type: string, data: any }> = new EventEmitter()
  @Output('clickBtn') buttonClick: EventEmitter<void> = new EventEmitter();
  @ViewChild(MatPaginator) matPaginator!: MatPaginator;
  @Input('columns') displayedColumns: any;
  @ViewChild(MatSort) matSort!: MatSort;
  @Input() buttonText!: string;
  @Input() tableText: string = 'User tableText para personalizar este campo';
  @Input() resorce: any;
  @Input() permissions!: Array<string>;
  @Input() img: string = 'users';
  @Input() iconButton: string = 'add_circle'
  headers!: string[]
  dataSource!: MatTableDataSource<any>
  canCreate: boolean = false;
  constructor() { }

  ngOnInit(): void {
    this.headers = this.displayedColumns.map((k: any) => k.key);
  }

  ngAfterViewInit(): void { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['resorce']) {
      this.tableConfig()
    }
  }

  tableConfig() {
    this.dataSource = new MatTableDataSource(this.resorce?.rows || this.resorce);
    this.dataSource.paginator = this.matPaginator;
    this.dataSource.sort = this.matSort;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;


    this.dataSource.filter = filterValue.trim().toLowerCase();

    this.dataSource.filterPredicate = (data:any, filter:string) => {
      if(data.carrdevi.device.deviimei) {
        return data.carrdevi.device.deviimei.includes(filter)
      }
    }

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
