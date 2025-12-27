import { Routes } from '@angular/router';
import { SitesPage } from './pages/sites/sites';
import { CategoriesPage } from './pages/categories/categories';

export const routes: Routes = [
  { path: '', redirectTo: 'sites', pathMatch: 'full' },
  { path: 'sites', component: SitesPage },
  { path: 'categories', component: CategoriesPage },
];
