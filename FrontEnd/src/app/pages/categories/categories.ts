import { Component } from '@angular/core';
import { CrudPageComponent, CrudConfig } from '../../shared/crud-page/crud-page';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-categories-page',
  imports: [CrudPageComponent, RouterLink],
  templateUrl: './categories.html',
})
export class CategoriesPage {
  config: CrudConfig = {
    title: 'Categorías',
    endpoint: '/categories',
    idKey: 'id',
    columns: [{ key: 'name', label: 'Nombre' }],
    fields: [
      { key: 'name', label: 'Nombre', type: 'text', required: true, placeholder: 'Ej: Aseo' }
    ],
    toCreatePayload: f => ({ name: String(f.name ?? '').trim() }),
    toUpdatePayload: f => ({ name: String(f.name ?? '').trim() }),
  };
}

