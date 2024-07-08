import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskSetAddComponent } from './task-set-add.component';

describe('TaskSetAddComponent', () => {
  let component: TaskSetAddComponent;
  let fixture: ComponentFixture<TaskSetAddComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TaskSetAddComponent]
    });
    fixture = TestBed.createComponent(TaskSetAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
