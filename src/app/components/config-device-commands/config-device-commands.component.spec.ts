import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigDeviceCommandsComponent } from './config-device-commands.component';

describe('ConfigDeviceCommandsComponent', () => {
  let component: ConfigDeviceCommandsComponent;
  let fixture: ComponentFixture<ConfigDeviceCommandsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfigDeviceCommandsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigDeviceCommandsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
