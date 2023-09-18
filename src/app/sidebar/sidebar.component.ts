import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit {
  @Output('collapse') collapseEmit: EventEmitter<boolean> = new EventEmitter(); 
  private options = [
    { name: 'Mapa', icon: 'pie_chart', permission: 'locations_read' },
    { name: 'Entidades', icon: 'work', permission: 'entity_get' },
    { name: 'Vehiculos', icon: 'directions_car', permission: 'carrier_get' },
    { name: 'Users', icon: 'group', permission: 'user_get' },
    { name: 'GPS', icon: 'share_location', permission: 'device_get' },
    { name: 'Clasificadores', icon: 'share_location', permission: 'clasifiers_get' },
  ];

  shortcut: IOptions[] = [{ name: 'Informes', icon: 'feed', permission: 'a' }, { name: 'Ajustes', icon: 'settings', permission: 'c' }];
  navigationOption!: Array<IOptions>;
  role: string = localStorage.getItem('role') as string;
  username: string = localStorage.getItem('name') as string;
  isCollapseSidebar: boolean = false
  constructor(private router: Router) { }

  ngOnInit(): void {
    this.navigationOption = this.options;
  }

  logOut() {
    localStorage.clear();
    this.router.navigate(['/'])
  }

  collapse() {
    this.isCollapseSidebar = !this.isCollapseSidebar;
    this.collapseEmit.emit(this.isCollapseSidebar)
  }
}

interface IOptions {
  name: string
  icon: string
  permission: string
}