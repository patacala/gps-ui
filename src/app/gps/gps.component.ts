import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { GpsModal } from '@modals';
import { SnackAlert, TableComponent } from '@components';
import { Observable, tap } from 'rxjs';
import { DeviceService } from '@services';

@Component({
  selector: 'app-gps',
  templateUrl: './gps.component.html',
  imports: [CommonModule, MatDialogModule, TableComponent],
  standalone: true
})
export class GpsComponent implements OnInit {
  tableContent = [{ key: 'deviimei', name: 'ID' }, { key: 'devimark', name: 'Marca' }, { key: 'devimode', name: 'Modelo' }, { key: 'devistat', name: 'Estado' }, { key: 'action', name: 'Acción' }]
  gps$!: Observable<any>;
  constructor(private dialog: MatDialog, private _device: DeviceService, private _snack: SnackAlert) { }

  ngOnInit(): void {
    this.gps$ = this._device.getDevice()
  }

  openCreateUser(data?: any): void {
    let modalRef = this.dialog.open(GpsModal, { width: '600px', data });

    let modalCloseSub = modalRef.componentInstance.close.subscribe(() => {
      modalRef.close();
      modalCloseSub.unsubscribe();
    });
  }
  actionsButton(event: any) {
    if (event.type === 'Edit') {
      this.openCreateUser(event.data)
      return;
    }
    this.deleteDevice(event.data.devinuid);
  }

  deleteDevice(deviceId: string) {
    this._device.deleteDevice(deviceId).pipe(
      tap((res: any) => this._snack.showSuccess("Dispositivo Eliminado correctamente"))
    ).subscribe()
  }
}