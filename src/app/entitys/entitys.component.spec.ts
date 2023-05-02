import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntitysComponent } from './entitys.component';

describe('EntitysComponent', () => {
  let component: EntitysComponent;
  let fixture: ComponentFixture<EntitysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EntitysComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntitysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
