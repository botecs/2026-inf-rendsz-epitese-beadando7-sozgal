import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../core/api.config';
import type { ScreeningRow } from '../models/screening.model';

@Injectable({ providedIn: 'root' })
export class ScreeningService {
  private http = inject(HttpClient);
  private api = inject(API_BASE_URL);

  getScreenings(): Observable<ScreeningRow[]> {
    return this.http.get<ScreeningRow[]>(`${this.api}/screenings`);
  }
}
