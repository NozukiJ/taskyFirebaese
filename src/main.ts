import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { routes } from './app/app-routing.module';
import { AppComponent } from './app/app.component';
import { importProvidersFrom } from '@angular/core';
import { AppModule } from './app/app.module';

// スタンドアロンコンポーネントのインポート
import { TaskSetComponent } from './app/components/task-set/task-set.component';
import { IntervalSetAddComponent } from './app/components/interval-set-add/interval-set-add.component';
import { IntervalSetEditComponent } from './app/components/interval-set-edit/interval-set-edit.component';

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(AppModule),
    provideRouter(routes)
  ]
}).catch(err => console.error(err));
