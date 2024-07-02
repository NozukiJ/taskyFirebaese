import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Project } from '../models/project.model';
import { Observable } from 'rxjs';
import firebase from 'firebase/compat/app';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  constructor(private firestore: AngularFirestore) {}

  getProjects(): Observable<Project[]> {
    console.log('Fetching all projects from Firestore...');
    return this.firestore.collection<Project>('projects').valueChanges({ idField: 'id' });
  }

  getProjectById(id: string): Observable<Project | undefined> {
    console.log(`Fetching project by ID: ${id}`);
    return this.firestore.collection<Project>('projects').doc(id).valueChanges();
  }

  addProject(project: Project): Promise<void> {
    return this.firestore.collection('projects').doc(project.id).set(project)
      .then(() => {
        console.log(`Project with ID: ${project.id} successfully added.`);
      })
      .catch(error => {
        console.error(`Error adding project with ID: ${project.id}`, error);
        throw error; // エラーを再度投げて、呼び出し元でもハンドリングできるようにする
      });
  }

  updateProject(project: Project): Promise<void> {
    return this.firestore.collection('projects').doc(project.id).update(project)
      .then(() => {
        console.log(`Project with ID: ${project.id} successfully updated.`);
      })
      .catch(error => {
        console.error(`Error updating project with ID: ${project.id}`, error);
        throw error; // エラーを再度投げて、呼び出し元でもハンドリングできるようにする
      });
  }

  deleteProject(project: Project): Promise<void> {
    if (project.id) {
      console.log(`Deleting project with ID: ${project.id}`);
      return this.firestore.collection('projects').doc(project.id).delete()
        .then(() => console.log(`Project deleted successfully with ID: ${project.id}`))
        .catch(error => {
          console.error(`Error deleting project with ID: ${project.id}`, error);
          throw error;
        });
    } else {
      console.error('Project ID is missing, cannot delete project', project);
      return Promise.reject('Project ID is missing');
    }
  }

  addMemberToProject(projectId: string, userId: string): Promise<void> {
    if (userId) {
      console.log(`Adding member with ID: ${userId} to project with ID: ${projectId}`);
      return this.firestore.collection('projects').doc(projectId).update({
        members: firebase.firestore.FieldValue.arrayUnion(userId)
      })
      .then(() => console.log(`Member with ID: ${userId} added to project with ID: ${projectId} successfully`))
      .catch(error => {
        console.error(`Error adding member with ID: ${userId} to project with ID: ${projectId}`, error);
        throw error;
      });
    } else {
      console.error('User ID is undefined, cannot add member to project', projectId);
      return Promise.reject('User ID is undefined');
    }
  }

  removeMemberFromProject(projectId: string, userId: string): Promise<void> {
    if (userId) {
      console.log(`Removing member with ID: ${userId} from project with ID: ${projectId}`);
      return this.firestore.collection('projects').doc(projectId).update({
        members: firebase.firestore.FieldValue.arrayRemove(userId)
      })
      .then(() => console.log(`Member with ID: ${userId} removed from project with ID: ${projectId} successfully`))
      .catch(error => {
        console.error(`Error removing member with ID: ${userId} from project with ID: ${projectId}`, error);
        throw error;
      });
    } else {
      console.error('User ID is undefined, cannot remove member from project', projectId);
      return Promise.reject('User ID is undefined');
    }
  }

  addOwnerToProject(projectId: string, userId: string): Promise<void> {
    if (userId) {
      console.log(`Adding owner with ID: ${userId} to project with ID: ${projectId}`);
      return this.firestore.collection('projects').doc(projectId).update({
        owners: firebase.firestore.FieldValue.arrayUnion(userId)
      })
      .then(() => console.log(`Owner with ID: ${userId} added to project with ID: ${projectId} successfully`))
      .catch(error => {
        console.error(`Error adding owner with ID: ${userId} to project with ID: ${projectId}`, error);
        throw error;
      });
    } else {
      console.error('User ID is undefined, cannot add owner to project', projectId);
      return Promise.reject('User ID is undefined');
    }
  }

  removeOwnerFromProject(projectId: string, userId: string): Promise<void> {
    if (userId) {
      console.log(`Removing owner with ID: ${userId} from project with ID: ${projectId}`);
      return this.firestore.collection('projects').doc(projectId).update({
        owners: firebase.firestore.FieldValue.arrayRemove(userId)
      })
      .then(() => console.log(`Owner with ID: ${userId} removed from project with ID: ${projectId} successfully`))
      .catch(error => {
        console.error(`Error removing owner with ID: ${userId} from project with ID: ${projectId}`, error);
        throw error;
      });
    } else {
      console.error('User ID is undefined, cannot remove owner from project', projectId);
      return Promise.reject('User ID is undefined');
    }
  }
}
