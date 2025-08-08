import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentsTable } from './appointments-table';

describe('AppointmentsTable', () => {
  let component: AppointmentsTable;
  let fixture: ComponentFixture<AppointmentsTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentsTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppointmentsTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
