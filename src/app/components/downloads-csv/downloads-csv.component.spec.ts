import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadsCsvComponent } from './downloads-csv.component';

describe('DownloadsCsvComponent', () => {
  let component: DownloadsCsvComponent;
  let fixture: ComponentFixture<DownloadsCsvComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DownloadsCsvComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DownloadsCsvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
