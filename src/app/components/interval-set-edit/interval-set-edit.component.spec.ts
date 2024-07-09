import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntervalSetEditComponent } from './interval-set-edit.component';

describe('IntervalSetEditComponent', () => {
  let component: IntervalSetEditComponent;
  let fixture: ComponentFixture<IntervalSetEditComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IntervalSetEditComponent]
    });
    fixture = TestBed.createComponent(IntervalSetEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
