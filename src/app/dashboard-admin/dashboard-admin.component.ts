import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MapComponent, StatisticComponent, UserAddedComponent } from '@components'
import { UserService, VehiculeService } from '@services'
import { forkJoin, Observable } from 'rxjs';
import { map, mergeMap, tap} from 'rxjs/operators';
import { TableHistoryComponent } from '../components/table-history/table-history.component';
@Component({
  selector: 'app-dashboard-admin',
  templateUrl: './dashboard-admin.component.html',
  standalone: true,
  imports: [
    CommonModule, MapComponent, 
    StatisticComponent, UserAddedComponent, 
    TableHistoryComponent
  ]
})
export class DashboardAdminComponent implements OnInit {
  data$!: Observable<any>
  constructor(private _vehicule: VehiculeService, private _user: UserService) { }

  ngOnInit(): void {

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
  }
}
