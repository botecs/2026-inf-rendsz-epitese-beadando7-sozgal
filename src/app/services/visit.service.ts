import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../core/api.config';
import type { Visit } from '../models/visit.model';

@Injectable({ providedIn: 'root' })
export class VisitService {
  private http = inject(HttpClient);
  private api = inject(API_BASE_URL);

  getAll(): Observable<Visit[]> {
    return this.http.get<Visit[]>(`${this.api}/visits`);
  }

  create(payload: Partial<Visit>): Observable<Visit> {
    return this.http.post<Visit>(`${this.api}/visits`, payload);
  }

  getHistoryByPatient(patientId: number): Observable<Visit[]> {
    return this.http.get<Visit[]>(`${this.api}/visits/history/${patientId}`);
  }

  update(payload: Partial<Visit>): Observable<Visit> {
    return this.http.put<Visit>(`${this.api}/visits`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/visits/${id}`);
  }
}
