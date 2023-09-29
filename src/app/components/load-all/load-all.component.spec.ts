import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadAllComponent } from './load-all.component';

describe('LoadAllComponent', () => {
  let component: LoadAllComponent;
  let fixture: ComponentFixture<LoadAllComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoadAllComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadAllComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
