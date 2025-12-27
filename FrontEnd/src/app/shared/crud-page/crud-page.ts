import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
  NgZone,      
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ApiService, AlertMessage } from '../../services/api';

export type CrudId = number | string;

export type CrudField =
  | { key: string; label: string; type: 'text'; placeholder?: string; required?: boolean }
  | { key: string; label: string; type: 'url'; placeholder?: string; required?: boolean }
  | {
      key: string;
      label: string;
      type: 'select';
      required?: boolean;
      optionsLoader: () => Observable<Array<{ value: CrudId; label: string }>>;
      placeholder?: string;
    };

export interface CrudColumn {
  key: string;
  label: string;
  width?: string;
  isLink?: boolean;
}

export interface CrudConfig {
  title: string;
  endpoint: string;   // ej: '/categories'
  idKey: string;      // ej: 'id'
  columns: CrudColumn[];
  fields: CrudField[];
  mapList?: (raw: any) => any[];
  toCreatePayload?: (form: any) => any;
  toUpdatePayload?: (form: any) => any;
}

@Component({
  standalone: true,
  selector: 'app-crud-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './crud-page.html',
})
export class CrudPageComponent implements OnInit, OnChanges {
  @Input({ required: true }) config!: CrudConfig;

  items: any[] = [];
  form: Record<string, any> = {};
  mode: 'create' | 'edit' = 'create';

  saving = false;
  deletingId: CrudId | null = null;
  editingId: CrudId | null = null;

  alerts: AlertMessage[] = [];

  selectOptions: Record<string, Array<{ value: CrudId; label: string }>> = {};

  page = 1;
  pageSize = 10;
  total = 0;

  get totalPages(): number {
    return this.total === 0 ? 1 : Math.ceil(this.total / this.pageSize);
  }
  readonly instanceId = Math.random().toString(36).substring(2, 9);
  constructor(private api: ApiService, private zone: NgZone,private cdr: ChangeDetectorRef,) {}

 ngOnInit(): void {
  

    this.api.alerts$.subscribe((a) => (this.alerts = a));
    this.initForm();
    this.loadSelects();
    this.load(1);              // 👈 aquí se carga la lista inicial
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config'] && this.config) {
      this.resetState();
      this.load(1);
    }
  }

  // ---------- helpers ----------

  private resetState(): void {
    this.mode = 'create';
    this.editingId = null;
    this.page = 1;
    this.initForm();
    this.loadSelects();
    this.saving = false;
    this.deletingId = null;
  }

  private initForm(): void {
    this.form = {};
    if (!this.config) return;
    for (const f of this.config.fields) {
      this.form[f.key] = null;
    }
  }

  private loadSelects(): void {
    if (!this.config) return;
    for (const f of this.config.fields) {
      if (f.type === 'select') {
        this.selectOptions[f.key] = [];
        f.optionsLoader().subscribe({
          next: (opts) => (this.selectOptions[f.key] = opts),
        });
      }
    }
  }

  // ---------- carga principal ----------

 load(page: number = 1): void {
    this.api.clearAlerts();

    const url = `${this.config.endpoint}?page=${page}&pageSize=${this.pageSize}`;

    this.api.get<any>(url).subscribe({
      next: (raw) => {
        this.zone.run(() => {
          try {
            const data = this.config.mapList ? this.config.mapList(raw) : raw;

            if (Array.isArray(data)) {
              this.items = data;
              this.total = data.length;
              this.page = 1;
            } else {
              this.items = Array.isArray(data.items) ? data.items : [];
              this.total =
                typeof data.total === 'number' ? data.total : this.items.length;
              this.page =
                typeof data.page === 'number' ? data.page : page;
              this.pageSize =
                typeof data.pageSize === 'number'
                  ? data.pageSize
                  : this.pageSize;
            }
          } catch (e) {
            console.error('Error en mapList de CrudPage', e);
            this.items = [];
            this.total = 0;
            this.page = 1;
            this.api.error('Error procesando los datos del servidor.');
          }

          // 🔑 aseguramos que la tabla se refresque
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.zone.run(() => {
          this.items = [];
          this.total = 0;
          this.page = 1;
          // ApiService ya lanza alerta
          this.cdr.detectChanges();
        });
      },
    });
  }



  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.load(page);
  }

  // ---------- modos ----------

  startCreate(): void {
    this.mode = 'create';
    this.editingId = null;
    this.initForm();
    this.saving = false;
    this.deletingId = null;
  }

  startEdit(item: any): void {
    this.mode = 'edit';
    this.editingId = item[this.config.idKey];
    for (const f of this.config.fields) {
      this.form[f.key] = item[f.key] ?? null;
    }
  }

  cancelEdit(): void {
    this.startCreate();
  }

  // ---------- submit ----------

  submit(): void {
    this.api.clearAlerts();

    for (const f of this.config.fields) {
      if (
        f.required &&
        (this.form[f.key] === null ||
          this.form[f.key] === '' ||
          this.form[f.key] === undefined)
      ) {
        this.api.info(`El campo "${f.label}" es obligatorio.`);
        return;
      }
    }

    if (this.saving) return;
    this.saving = true;

    const isEdit = this.mode === 'edit' && this.editingId !== null;

    const payload = isEdit
      ? this.config.toUpdatePayload
        ? this.config.toUpdatePayload(this.form)
        : this.form
      : this.config.toCreatePayload
      ? this.config.toCreatePayload(this.form)
      : this.form;

    const request$ = isEdit
      ? this.api.put(this.config.endpoint, this.editingId!, payload)
      : this.api.post(this.config.endpoint, payload);

    request$
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: () => {
          if (isEdit) {
            this.api.success('Actualizado ✅');
            this.startCreate();
            this.load(this.page);
          } else {
            this.api.success('Guardado ✅');
            this.initForm();
            this.load(1);
          }
        },
        error: () => {
          // ApiService ya maneja error
        },
      });
  }

  // ---------- delete ----------

  remove(item: any): void {
    const id = item[this.config.idKey] as CrudId;
    if (!confirm('¿Desea eliminar este registro?')) return;

    this.api.clearAlerts();
    this.deletingId = id;

    this.api
      .delete(this.config.endpoint, id)
      .pipe(finalize(() => (this.deletingId = null)))
      .subscribe({
        next: () => {
          this.api.success('Eliminado ✅');
          if (this.editingId === id) this.startCreate();

          const nextPage =
            this.items.length === 1 && this.page > 1
              ? this.page - 1
              : this.page;

          this.load(nextPage);
        },
        error: () => {
          // ApiService ya maneja error
        },
      });
  }
}
