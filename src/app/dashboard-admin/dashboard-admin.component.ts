import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MapComponent, StatisticComponent, UserAddedComponent } from '@components'
import { MapService, UserService, VehiculeService } from '@services'
import { Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { TableHistoryComponent } from '../components/table-history/table-history.component';
import { ConfigDeviceCommandsComponent } from '../components/config-device-commands/config-device-commands.component';

@Component({
  selector: 'app-dashboard-admin',
  templateUrl: './dashboard-admin.component.html',
  styleUrls: ['./dashboard-admin.component.scss'],
  standalone: true,
  imports: [
    CommonModule, MapComponent, 
    StatisticComponent, UserAddedComponent, 
    TableHistoryComponent, ConfigDeviceCommandsComponent,
  ]
})
export class DashboardAdminComponent implements OnInit {
  permissions: any[]=[];
  data$!: Observable<any>
  hiddenListHisto: boolean = true;
  sizeLevel: number = 0;

  constructor(
    private _vehicule: VehiculeService, 
    private _user: UserService,
    private _map: MapService
  ) { }

  ngOnInit(): void {
    this.permissions = this._user.permissions;
    this.data$ = this._user.getUsers().pipe(
      mergeMap(users => this._vehicule.getVehicules()
        .pipe(
          map(vehicules => {
            return {
              vehicules: vehicules.count,
              users: users.count
            }
          })
        )
      )
    );
    
    this._map.getHiddenListHisto().subscribe((val: any) => {
      console.log(val);
      this.hiddenListHisto = val?.hiddenListHisto;
      this.sizeLevel = val?.sizeControl;
    });
  }

  sizeControl() {
    if (!this.hiddenListHisto && this.sizeLevel === 1) {
      return 'animate-small';
    } else if (!this.hiddenListHisto && this.sizeLevel === 2) {
      return 'animate-median';
    }

    return '';
  }
}
