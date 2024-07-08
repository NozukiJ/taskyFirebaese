import { NgModule, importProvidersFrom } from '@angular/core';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClientModule } from '@angular/common/http';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { provideRouter } from '@angular/router';
import { routes } from './app-routing.module';
import { environment } from '../environments/environment';
import { ProjectProgressComponent } from './components/project-progress/project-progress.component';
import { AuthService } from './core/services/auth.service';
import { ProjectService } from './core/services/project.service';
import { TaskService } from './core/services/task.service';
import { HighchartsChartModule } from 'highcharts-angular';
import { AppComponent } from './app.component';
import { TaskSetComponent } from './components/task-set/task-set.component';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    MatDialogModule,
    MatSnackBarModule,
    HttpClientModule,
    CalendarModule.forRoot({ provide: DateAdapter, useFactory: adapterFactory }),
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    AngularFirestoreModule,
    HighchartsChartModule,
    TaskSetComponent  // TaskSetComponentをここに追加
  ],
  declarations: [
    ProjectProgressComponent
  ],
  providers: [AuthService, ProjectService, TaskService],
  bootstrap: []
})
export class AppModule { }

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(AppModule),
    provideRouter(routes)
  ]
}).catch(err => console.error(err));
