import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MastersTable } from './masters-table';

describe('MastersTable', () => {
  let component: MastersTable;
  let fixture: ComponentFixture<MastersTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MastersTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MastersTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
