import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataTimeHComponent } from './data-time-h.component';

describe('DataTimeHComponent', () => {
  let component: DataTimeHComponent;
  let fixture: ComponentFixture<DataTimeHComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataTimeHComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataTimeHComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
