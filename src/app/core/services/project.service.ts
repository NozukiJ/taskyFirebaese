import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Project } from '../models/project.model';
import { User } from '../models/user.model';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import firebase from 'firebase/compat/app';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  constructor(private firestore: AngularFirestore) {}

  getProjects(): Observable<Project[]> {
    return this.firestore.collection<Project>('projects').valueChanges();
  }

  getProjectById(id: string): Observable<Project | undefined> {
    return this.firestore.collection<Project>('projects').doc(id).valueChanges();
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

  addMemberToProject(projectId: string, userId: string): Promise<void> {
    return this.firestore.collection('projects').doc(projectId).update({
      members: firebase.firestore.FieldValue.arrayUnion(userId)
    });
  }

  removeMemberFromProject(projectId: string, userId: string): Promise<void> {
    return this.firestore.collection('projects').doc(projectId).update({
      members: firebase.firestore.FieldValue.arrayRemove(userId)
    });
  }

  getAllUsers(): Observable<User[]> {
    return this.firestore.collection<User>('users').valueChanges();
  }

  getUsersByIds(userIds: string[]): Observable<User[]> {
    if (!userIds || userIds.length === 0) {
      return new Observable<User[]>((observer) => observer.next([]));
    }
    
    const userObservables = userIds.map(id => 
      this.firestore.collection('users').doc<User>(id).valueChanges()
    );

    return forkJoin(userObservables).pipe(
      map(users => users.filter(user => user !== undefined) as User[])
    );
  }
}
