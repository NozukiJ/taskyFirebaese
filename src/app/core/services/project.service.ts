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
    const id = this.firestore.createId();
    console.log(`Adding new project with ID: ${id}`, project);
    return this.firestore.collection('projects').doc(id).set({ ...project, id })
      .then(() => console.log(`Project added successfully with ID: ${id}`))
      .catch(error => {
        console.error(`Error adding project with ID: ${id}`, error);
        throw error;
      });
  }

  updateProject(updatedProject: Project): Promise<void> {
    if (updatedProject.id) {
      console.log(`Updating project with ID: ${updatedProject.id}`, updatedProject);
      return this.firestore.collection('projects').doc(updatedProject.id).set(updatedProject)
        .then(() => console.log(`Project updated successfully with ID: ${updatedProject.id}`))
        .catch(error => {
          console.error(`Error updating project with ID: ${updatedProject.id}`, error);
          throw error;
        });
    } else {
      console.error('Project ID is missing, cannot update project', updatedProject);
      return Promise.reject('Project ID is missing');
    }
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
