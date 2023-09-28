import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { HistoryLoc, HistoryData2 } from './table-history.model';
import { DeviceService, MapService } from '@services';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DatePipe, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ButtonComponent } from '../button/button.component';
import { UtilsService } from 'src/app/services/utils/utils.service';

@Component({
  selector: 'app-table-history',
  standalone: true,
  providers: [DatePipe],
  imports: [MatTableModule, MatPaginatorModule, DatePipe, MatIconModule, NgIf, ButtonComponent],
  templateUrl: './table-history.component.html',
  styleUrls: ['./table-history.component.scss']
})
export class TableHistoryComponent implements OnInit {
  deviceId: number = -1;
  openInfoLoc: []=[];
  dataSrcHistoSta: boolean = false;
  deviceFilter: HistoryData2[]=[];
  dataSrcHistory = new MatTableDataSource<HistoryLoc>([]);
  columnsHistory: string[] = ['delotime', 'deloacc', 'delodoor', 'devent', 'dspeed', 'daddress', 'delofesi', 'action'];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  constructor(
    private _device: DeviceService,
    private _map: MapService,
    private datePipe: DatePipe,
    private matPaginatorIntl: MatPaginatorIntl,
    private changeDetectorRef: ChangeDetectorRef,
    private _utils: UtilsService
  ) {
    this.matPaginatorIntl.itemsPerPageLabel = 'Ubicaciones por página';
    this.paginator = new MatPaginator(this.matPaginatorIntl, this.changeDetectorRef);
  }

  ngOnInit(): void {
    this._device.getHistoryLoc().subscribe((data: { deviceId: number, historyLocs: HistoryLoc[] }) => {
      this.deviceId = data?.deviceId;
      this.dataSrcHistory.data = data?.historyLocs;
      this.dataSrcHistory.paginator = this.paginator;
      this.dataSrcHistory.sort = this.sort;
      this.dataSrcHistoSta = data?.historyLocs?.length ? true:false;
      if (this.dataSrcHistoSta) {
        this.deviceFilter = this.processFilterData(data?.historyLocs);
      }
    });

    this.openInfoLocIds();
  }

  formatTimestamp(timestamp: string): string {
    const year = timestamp.slice(0, 2);
    const month = timestamp.slice(2, 4);
    const day = timestamp.slice(4, 6);
    const hour = timestamp.slice(6, 8);
    const min = timestamp.slice(8, 10);
    const sec = timestamp.slice(10, 12);

    const formattedDate = `20${year}-${month}-${day} ${hour}:${min}:${sec}`;
    const date = new Date(formattedDate);

    return this.datePipe.transform(date, 'yyyy-MM-dd HH:mm:ss') || '';
  }

  openInfoWdById(id: string) {
    this._map.openInfoWdById(this.deviceId.toString(), id);
  }

  openInfoLocIds() {
    this._map.getOpenInfoLocIds().subscribe((result: any) => {
      this.openInfoLoc = result;
    });
  }

  hidIconInfoLoc(id: string) {
    const openInfId = this.openInfoLoc.findIndex(openInfId => openInfId === id.toString());
    if (openInfId === -1) return true;
    return false;
  }

  processFilterData(datas: any) {
    const newArray: HistoryData2[]=[];

    datas?.forEach((location: any) => {
      newArray.push({
        'FECHA GPS': this.formatTimestamp(location.delotime),
        ACC: location.deloacc === '1' ? 'Encendido':'Apagado',
        PUERTA: location.delodoor === '1' ? 'Abierta':'Cerrada',
        EVENTO: location.keywfunc,
        VELOCIDAD: location.delospee,
        DIRECCION: location.delodire,
        "FECHA SISTEMA": location.delofesi,
      });
    });
    return newArray;  
  }

  // Exportar .csv
  saveDataInCSV(name: string, data: Array<any>): void {
    this._utils.saveDataInCSV(name, data);
  }
}
