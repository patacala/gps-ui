import { NgModule } from '@angular/core';
import { LayoutRoutingModule } from './layout-routing.module'
import { LayoutComponent } from './layout.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon'
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';
import {MatDividerModule} from '@angular/material/divider';
import { PermissionDirective } from '../directives/permission.directive';

@NgModule({
    declarations: [LayoutComponent, SidebarComponent],
    imports: [LayoutRoutingModule, MatSidenavModule, CommonModule, MatIconModule, MatDividerModule, PermissionDirective],
    exports: [LayoutRoutingModule]
})
export class LayoutModule { }