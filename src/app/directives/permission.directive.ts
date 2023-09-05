import { Directive, ElementRef, Input, OnInit } from "@angular/core";
import { UserService } from "../services/user/user.service";

@Directive({
    selector: '[hasPermission]',
    standalone: true
})
export class PermissionDirective implements OnInit {
    @Input() hasPermission!: string | string[];
    permission!: Set<string>;
    isSuperAdmin: boolean = JSON.parse(localStorage.getItem('isSuperAdmin') as string) == 1
    constructor(private el: ElementRef, private _user: UserService) {
        if (!this.isSuperAdmin) this.permission = new Set([...this._user.permissions]);
    }

    ngOnInit(): void {
        if (this.isSuperAdmin) {
            let hasPermission = Array.isArray(this.hasPermission) && this.hasPermission.find(p => p.endsWith('_' + this.el.nativeElement.dataset.action));
            console.log(hasPermission);

            if (hasPermission && !['entity_create', 'entity_update', 'entity_delete'].includes(hasPermission) || !['entity_get'].includes(this.hasPermission as string) && !hasPermission) {
                this.el.nativeElement.style.display = 'none';
                return;
            }
            return;
        }

        if (Array.isArray(this.hasPermission)) {
            let hasPermission = this.hasPermission.find(p => p.endsWith('_' + this.el.nativeElement.dataset.action));

            this.el.nativeElement.style.display = this.permission.has(hasPermission as string) ? '' : 'none';
            return;
        }

        this.el.nativeElement.style.display = this.permission.has(this.hasPermission) ? '' : 'none'
    }
}