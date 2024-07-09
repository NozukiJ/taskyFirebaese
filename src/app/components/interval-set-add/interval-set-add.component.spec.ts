import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntervalSetAddComponent } from './interval-set-add.component';

describe('IntervalSetAddComponent', () => {
  let component: IntervalSetAddComponent;
  let fixture: ComponentFixture<IntervalSetAddComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IntervalSetAddComponent]
    });
    fixture = TestBed.createComponent(IntervalSetAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
