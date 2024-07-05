import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectProgressComponent } from './project-progress.component';

describe('ProjectProgressComponent', () => {
  let component: ProjectProgressComponent;
  let fixture: ComponentFixture<ProjectProgressComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ProjectProgressComponent]
    });
    fixture = TestBed.createComponent(ProjectProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
