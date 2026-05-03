import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../core/api.config';
import type { Patient } from '../models/patient.model';

@Injectable({ providedIn: 'root' })
export class PatientService {
  private http = inject(HttpClient);
  private api = inject(API_BASE_URL);

  getAll(): Observable<Patient[]> {
    return this.http.get<Patient[]>(`${this.api}/patients`);
  }

  getById(id: number): Observable<Patient> {
    return this.http.get<Patient>(`${this.api}/patients/${id}`);
  }

  create(payload: Partial<Patient>): Observable<Patient> {
    return this.http.post<Patient>(`${this.api}/patients`, payload);
  }

  update(payload: Patient): Observable<Patient> {
    return this.http.put<Patient>(`${this.api}/patients`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/patients/${id}`);
  }
}
