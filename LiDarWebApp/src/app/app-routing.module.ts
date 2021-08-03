/* Angular Routing Module */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './ui_components/home/home.component';
import { DataFormComponent } from './ui_components/data-form/data-form.component';
import { VisualizationsComponent } from './ui_components/visualizations/visualizations.component';
import { SettingsComponent } from './ui_components/settings/settings.component';
import { AboutComponent } from './ui_components/about/about.component';

// Declare routes to each page in the application
const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: HomeComponent
  },
  {
    path: 'data-form',
    component: DataFormComponent
  },
  {
    path: 'visualizations',
    component: VisualizationsComponent
  },
  {
    path: 'settings',
    component: SettingsComponent
  },
  {
    path: 'about',
    component: AboutComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
