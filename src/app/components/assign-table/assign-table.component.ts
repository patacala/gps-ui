import { CommonModule } from "@angular/common";
import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from "@angular/core";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatRadioModule } from '@angular/material/radio';
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { ObjectValues } from "src/app/pipes/object-values.pipe";

@Component({
    selector: 'app-assign-table',
    templateUrl: './assign-table.component.html',
    standalone: true,
    imports: [MatPaginatorModule, MatTableModule, CommonModule, MatCheckboxModule, ObjectValues, MatRadioModule]
})
export class AssignTable implements OnInit, AfterViewInit, OnChanges {
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;
    @Input('columns') displayedColumns: any;
    @Input() resorce: any;
    @Output() checked: EventEmitter<any> = new EventEmitter();
    dataSource!: MatTableDataSource<any>;
    headers: any
    constructor() { }

    ngOnInit(): void {
        this.headers = this.displayedColumns.map((k: any) => k.key);
    }
    ngOnChanges(changes: SimpleChanges): void {
        if (changes['resorce']) {
            this.dataSource = new MatTableDataSource(this.resorce?.rows || this.resorce)
            console.log(this.resorce)
        }
    }
    
    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    shareElementChecked(event: any, data: any) {
        this.checked.emit(data)
    }
    createData(id: number) {
        let name = VEHICULES[Math.round(Math.random() * (VEHICULES.length - 1))];
        let gps = GPS[Math.round(Math.random() * (GPS.length - 1))];
        let placa = Math.round(Math.random() * 2);
        return {
            id: id.toString(),
            name,
            placa,
            type: name,
            gps,
            status: (id % 0) == 0
        }
    }
}


const VEHICULES = [
    "Dryvan",
    "Truck",
    "BMW",
    "Pigeot"
]

const GPS = [
    "BARRANQUILLA",
    "SANTA MARTA",
    "CARTAGENA"
]