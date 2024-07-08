import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskSetTaskDetailComponent } from './task-set-task-detail.component';

describe('TaskSetTaskDetailComponent', () => {
  let component: TaskSetTaskDetailComponent;
  let fixture: ComponentFixture<TaskSetTaskDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TaskSetTaskDetailComponent]
    });
    fixture = TestBed.createComponent(TaskSetTaskDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
