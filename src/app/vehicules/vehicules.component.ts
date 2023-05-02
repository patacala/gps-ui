import { Component, OnInit } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { VehiculeModal } from '../components/modals/vehicules/vehicules.modal';
import { ButtonComponent, ChipsComponent, SnackAlert, TableComponent } from '@components';
import { VehiculeService } from '@services';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-vehicules',
  templateUrl: './vehicules.component.html',
  imports: [MatCheckboxModule, CommonModule, TableComponent, MatIconModule, MatDialogModule, ButtonComponent, ChipsComponent],
  standalone: true
})
export class VehiculesComponent implements OnInit {
  tableContent = [{ key: 'carrlice', name: 'Placa' }, { key: 'carrtype', name: 'Tipo de vehículo' }, { key: 'carrdevi.device.deviimei', name: 'GPS asignado' }, { key: 'action', name: 'Acción' }]
  vehicules$!: Observable<any>;
  constructor(private dialog: MatDialog, private _vehicules: VehiculeService, private _snack: SnackAlert) { }

  ngOnInit(): void {
    this.vehicules$ = this._vehicules.getVehicules()
  }

  openCreateVehicule(data?: any): void {
    let modalRef = this.dialog.open(VehiculeModal, { width: '800px', data });

    let modalCloseSub = modalRef.componentInstance.close.subscribe(() => {
      modalRef.close();
      modalCloseSub.unsubscribe();
    });
  }

  deleteVehicule(vehiculeId: string) {
    this._vehicules.deleteVehicule(vehiculeId).subscribe((res) => {
      this._snack.showSuccess('Vehiculo eliminado correctamente');
    })
  }

  actionsButton(event: any) {
    if (event.type == 'Edit') {
      this.openCreateVehicule(event.data);
      return;
    }

    this.deleteVehicule(event.data.carrnuid)
  }
}