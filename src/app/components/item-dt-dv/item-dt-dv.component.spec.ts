import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemDtDvComponent } from './item-dt-dv.component';

describe('ItemDtDvComponent', () => {
  let component: ItemDtDvComponent;
  let fixture: ComponentFixture<ItemDtDvComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ItemDtDvComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItemDtDvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
