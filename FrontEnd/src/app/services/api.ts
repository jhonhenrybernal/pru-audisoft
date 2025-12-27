import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpResponse } from '@angular/common/http';
import { map } from 'rxjs/operators';


export type AlertType = 'success' | 'danger' | 'info' | 'warning';
export interface AlertMessage { type: AlertType; text: string; }

@Injectable({ providedIn: 'root' })
export class ApiService {
  // ✅ base URL centralizada aquí (sin InjectionToken)
  private readonly baseUrl = 'http://localhost:8090/api'; // cambia a 127.0.0.1 si aplica

  private readonly alertsSubject = new BehaviorSubject<AlertMessage[]>([]);
  readonly alerts$ = this.alertsSubject.asObservable();

  constructor(private http: HttpClient) {}

  // -------- Alerts (centralizadas) --------
  clearAlerts(): void {
    this.alertsSubject.next([]);
  }

  pushAlert(type: AlertType, text: string, autoClearMs = 2500): void {
    const next = [...this.alertsSubject.value, { type, text }];
    this.alertsSubject.next(next);
    if (autoClearMs > 0) setTimeout(() => this.clearAlerts(), autoClearMs);
  }

  success(text: string): void { this.pushAlert('success', text); }
  info(text: string): void { this.pushAlert('info', text); }
  warn(text: string): void { this.pushAlert('warning', text, 3500); }
  error(text: string): void { this.pushAlert('danger', text, 4500); }

  // -------- Helpers --------
  private url(path: string): string {
    const p = path.startsWith('/') ? path : `/${path}`;
    return `${this.baseUrl}${p}`;
  }

  private toParams(query?: Record<string, any>): HttpParams | undefined {
    if (!query) return undefined;
    let params = new HttpParams();
    for (const [k, v] of Object.entries(query)) {
      if (v === null || v === undefined || v === '') continue;
      params = params.set(k, String(v));
    }
    return params;
  }

  private normalizeError(err: HttpErrorResponse): string {
    if (typeof err.error === 'string' && err.error) return err.error;
    if (err.error?.message) return err.error.message;
    if (err.message) return err.message;
    return 'Error desconocido';
  }

  private handle(operation = 'Operación') {
    return (error: HttpErrorResponse) => {
      console.error(`[API] ${operation} error`, error);

      let userMessage = 'Ocurrió un error al procesar la solicitud.';

      const raw = error.error;

      // 1) Si viene como string (caso DELETE con responseType: 'text')
      if (typeof raw === 'string') {
        // Intentamos parsear como JSON (Symfony ProblemDetails)
        try {
          const problem = JSON.parse(raw);

          if (problem?.detail) {
            userMessage = String(problem.detail);
          } else if (problem?.message) {
            userMessage = String(problem.message);
          }
        } catch {
          // No es JSON, usamos el texto tal cual
          userMessage = raw;
        }
      }

      // 2) Si viene ya como objeto
      if (raw && typeof raw === 'object') {
        if ((raw as any).detail) {
          userMessage = String((raw as any).detail);
        } else if ((raw as any).message) {
          userMessage = String((raw as any).message);
        }
      }

      // 3) Limpieza específica para el caso de categoría en uso
      const marker = 'No se puede borrar';
      if (userMessage.includes(marker)) {
        // Nos quedamos solo con la parte "No se puede borrar: categoría en uso"
        userMessage = userMessage.substring(userMessage.indexOf(marker));
      }

      // 4) Fallback por si se quedó vacío
      if (!userMessage || userMessage.trim().length === 0) {
        userMessage = `${operation} falló (código ${error.status}).`;
      }

      // Mostrar solo el mensaje limpio en la alerta roja
      this.error(userMessage);

      return throwError(() => error);
    };
  }


  // -------- CRUD genérico (sin Categories/Sites) --------
  get<T>(path: string, query?: Record<string, any>): Observable<T> {
    return this.http.get<T>(this.url(path), { params: this.toParams(query) })
      .pipe(catchError(this.handle('GET')));
  }

  show<T>(path: string, id: number | string, query?: Record<string, any>): Observable<T> {
    return this.http.get<T>(this.url(`${path}/${id}`), { params: this.toParams(query) })
      .pipe(catchError(this.handle('SHOW')));
  }

 // POST
  post<TBody = unknown>(path: string, body: TBody) {
    return this.http
      .post(this.url(path), body, { observe: 'response', responseType: 'text' })
      .pipe(
        catchError(this.handle('POST'))
      );
  }

  // PUT
  put<TBody = unknown>(path: string, id: number | string, body: TBody) {
    return this.http
      .put(this.url(`${path}/${id}`), body, { observe: 'response', responseType: 'text' })
      .pipe(
        catchError(this.handle('PUT'))
      );
  }

  // DELETE
  delete(path: string, id: number | string) {
    return this.http
      .delete(this.url(`${path}/${id}`), { observe: 'response', responseType: 'text' })
      .pipe(
        catchError(this.handle('DELETE'))
      );
  }


}
