import { Component } from '@angular/core';
import { CrudPageComponent, CrudConfig } from '../../shared/crud-page/crud-page';
import { ApiService } from '../../services/api';
import { RouterLink } from '@angular/router';
import { map } from 'rxjs/operators';

@Component({
  standalone: true,
  selector: 'app-sites-page',
  imports: [CrudPageComponent, RouterLink],
  template: `
    <div class="container my-3">
      <a routerLink="/categories" class="btn btn-outline-primary mb-3">Categorías</a>
      <app-crud-page [config]="config"></app-crud-page>
    </div>
  `,
})
export class SitesPage {
  constructor(private api: ApiService) {}

  config: CrudConfig = {
    title: 'Mis sitios favoritos',
    endpoint: '/sites',
    idKey: 'id',
    columns: [
      { key: 'name', label: 'Nombre' },
      { key: 'url', label: 'Dirección', isLink: true },
      { key: 'categoryName', label: 'Categoría' },
    ],
    fields: [
      { key: 'name', label: 'Nombre', type: 'text', required: true },
      { key: 'url', label: 'URL', type: 'url', required: true },
      {
        key: 'categoryId',
        label: 'Categoría',
        type: 'select',
        required: true,
        optionsLoader: () =>
          this.api.get<any>('/categories', { page: 1, pageSize: 1000 }).pipe(
            map(raw => {
              const cats = Array.isArray(raw) ? raw : raw.items ?? [];
              return cats.map((c: any) => ({
                value: c.id,
                label: c.name,
              }));
            })
          ),

      },
    ],
    toCreatePayload: f => ({
      name: String(f.name ?? '').trim(),
      url: String(f.url ?? '').trim(),
      categoryId: Number(f.categoryId),
    }),
    toUpdatePayload: f => ({
      name: String(f.name ?? '').trim(),
      url: String(f.url ?? '').trim(),
      categoryId: Number(f.categoryId),
    }),
  };
}
