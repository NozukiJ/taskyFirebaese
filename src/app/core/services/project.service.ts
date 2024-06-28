import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore'; // 修正
import { Project } from '../models/project.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  constructor(private firestore: AngularFirestore) {}

  getProjects(): Observable<Project[]> {
    return this.firestore.collection<Project>('projects').valueChanges();
  }

  addProject(project: Project): Promise<void> {
    const id = this.firestore.createId();
    return this.firestore.collection('projects').doc(id).set({ ...project, id });
  }

  updateProject(updatedProject: Project): Promise<void> {
    if (updatedProject.id) {
      return this.firestore.collection('projects').doc(updatedProject.id).set(updatedProject);
    } else {
      return Promise.reject('Project ID is missing');
    }
  }

  deleteProject(project: Project): Promise<void> {
    if (project.id) {
      return this.firestore.collection('projects').doc(project.id).delete();
    } else {
      return Promise.reject('Project ID is missing');
    }
  }
}
