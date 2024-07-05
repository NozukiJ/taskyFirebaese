import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectUserSearchComponent } from './project-user-search.component';

describe('ProjectUserSearchComponent', () => {
  let component: ProjectUserSearchComponent;
  let fixture: ComponentFixture<ProjectUserSearchComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ProjectUserSearchComponent]
    });
    fixture = TestBed.createComponent(ProjectUserSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
