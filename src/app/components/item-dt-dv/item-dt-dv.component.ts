import { Component, Input, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-item-dt-dv',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './item-dt-dv.component.html',
  styleUrls: ['./item-dt-dv.component.scss']
})
export class ItemDtDvComponent implements OnInit {
  @Input() title: string = '';
  @Input() info: string = '';
  @Input() icon: string = '';

  constructor() { }

  ngOnInit(): void {
  }

}
