import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import type { Patient } from '../../models/patient.model';
import type { Visit } from '../../models/visit.model';
import { PatientService } from '../../services/patient.service';
import { VisitService } from '../../services/visit.service';

@Component({
  selector: 'app-visits-page',
  imports: [ReactiveFormsModule],
  template: `
    <section class="page-stack">
      <header class="page-intro">
        <h2>Kórtörténet és új vizit</h2>
        <p>A kiválasztott beteg vizitjei egy helyen látszanak, és innen rögzíthető az új találkozó is.</p>
      </header>

      @if (error()) {
        <div class="alert alert-danger mb-0" role="alert">{{ error() }}</div>
      }

      <div class="grid-layout">
        <article class="feature-card">
          <div>
            <h3>Beteg kiválasztása</h3>
            <p class="text-secondary mb-0">A kórtörténet és az űrlap ugyanahhoz a beteghez kapcsolódik.</p>
          </div>

          <div>
            <label class="form-label" for="visit-patient">Beteg</label>
            <select
              #patientSelect
              id="visit-patient"
              class="form-select"
              [value]="selectedPatientId() ?? ''"
              (change)="selectPatient(patientSelect.value)"
            >
              <option value="">Válassz beteget</option>
              @for (patient of patients(); track trackByPatient($index, patient)) {
                <option [value]="patient.id">{{ patient.name }} - {{ patient.taj }}</option>
              }
            </select>
          </div>

          @if (selectedPatient(); as patient) {
            <div class="patient-badge">
              <div class="fw-semibold">{{ patient.name }}</div>
              <div class="text-secondary small">
                TAJ: {{ patient.taj }} · Születési dátum: {{ formatDate(patient.birthDate) }}
              </div>
            </div>
          }
        </article>

        <article class="feature-card">
          <div class="d-flex align-items-start justify-content-between gap-3 flex-wrap">
            <div>
              <h3>Korábbi vizitek</h3>
            </div>
            <span class="history-count">{{ history().length }} rekord</span>
          </div>

          @if (historyLoading()) {
            <div class="text-secondary py-3">Kórtörténet betöltése...</div>
          } @else if (!selectedPatientId()) {
            <div class="empty-state">Válassz beteget a vizitek megjelenítéséhez.</div>
          } @else if (history().length === 0) {
            <div class="empty-state">Ehhez a beteghez még nincs rögzített vizit.</div>
          } @else {
            <div class="table-responsive">
              <table class="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Dátum</th>
                    <th>Diagnózis</th>
                    <th>Gyógyszerek</th>
                    <th>Kezelések</th>
                    <th>Dokumentumok</th>
                    <th class="text-end">Műveletek</th>
                  </tr>
                </thead>
                <tbody>
                  @for (visit of history(); track trackByVisit($index, visit)) {
                    <tr>
                      <td class="text-nowrap">{{ formatDate(visit.date) }}</td>
                      <td>{{ visit.diagnosis }}</td>
                      <td>{{ visit.medications }}</td>
                      <td>{{ visit.treatments }}</td>
                      <td>{{ visit.documents || 'Nincs megadva' }}</td>
                      <td>
                        <div class="d-flex justify-content-end gap-2 flex-wrap">
                          <button class="btn btn-outline-secondary btn-sm" type="button" (click)="startEditVisit(visit)">Szerkesztés</button>
                          <button class="btn btn-outline-danger btn-sm" type="button" (click)="deleteVisit(visit)">Törlés</button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </article>

        <article class="feature-card feature-card-wide">
          <div>
            <h3>{{ editingVisitId() ? 'Vizit módosítása' : 'Új vizit rögzítése' }}</h3>
          </div>

          <form class="visit-form" [formGroup]="visitForm" (ngSubmit)="saveVisit()">
            <div class="row g-3">
              <div class="col-md-4">
                <label class="form-label" for="visit-form-patient">Beteg</label>
                <select id="visit-form-patient" class="form-select" formControlName="patientId">
                  <option value="">Válassz beteget</option>
                  @for (patient of patients(); track trackByPatient($index, patient)) {
                    <option [value]="patient.id">{{ patient.name }}</option>
                  }
                </select>
                @if (visitForm.controls.patientId.touched && visitForm.controls.patientId.invalid) {
                  <div class="text-danger small mt-1">A beteg kiválasztása kötelező.</div>
                }
              </div>

              <div class="col-md-4">
                <label class="form-label" for="visit-date">Dátum</label>
                <input id="visit-date" class="form-control" formControlName="date" type="date" />
                @if (visitForm.controls.date.touched && visitForm.controls.date.invalid) {
                  <div class="text-danger small mt-1">A dátum megadása kötelező.</div>
                }
              </div>

              <div class="col-md-4">
                <label class="form-label" for="visit-documents">Dokumentumok</label>
                <input
                  id="visit-documents"
                  class="form-control"
                  formControlName="documents"
                  type="text"
                  placeholder="Pl. labor, lelet"
                />
              </div>
            </div>

            <div>
              <label class="form-label" for="visit-diagnosis">Diagnózis</label>
              <textarea id="visit-diagnosis" class="form-control" formControlName="diagnosis" rows="3"></textarea>
              @if (visitForm.controls.diagnosis.touched && visitForm.controls.diagnosis.invalid) {
                <div class="text-danger small mt-1">A diagnózis megadása kötelező.</div>
              }
            </div>

            <div>
              <label class="form-label" for="visit-medications">Gyógyszerek</label>
              <textarea id="visit-medications" class="form-control" formControlName="medications" rows="2"></textarea>
            </div>

            <div>
              <label class="form-label" for="visit-treatments">Kezelések</label>
              <textarea id="visit-treatments" class="form-control" formControlName="treatments" rows="2"></textarea>
            </div>

            <div class="d-flex gap-2 flex-wrap">
              <button class="btn btn-primary" type="submit" [disabled]="saving()">
                {{ saving() ? 'Mentés...' : editingVisitId() ? 'Módosítás mentése' : 'Vizit rögzítése' }}
              </button>
              @if (editingVisitId()) {
                <button class="btn btn-outline-secondary" type="button" (click)="cancelEditVisit()">Mégse</button>
              }
              <button class="btn btn-outline-secondary" type="button" (click)="resetForm()">Űrlap ürítése</button>
            </div>
          </form>
        </article>
      </div>
    </section>
  `,
  styles: `
    :host {
      display: block;
    }

    .page-stack {
      display: grid;
      gap: 1.25rem;
    }

    .page-intro {
      display: grid;
      gap: 0.5rem;
    }

    h2,
    h3,
    p {
      margin: 0;
    }

    .page-intro p,
    .feature-card p,
    .empty-state {
      color: #475569;
      line-height: 1.6;
    }

    .grid-layout {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 1.25rem;
      align-items: start;
    }

    .feature-card {
      display: grid;
      gap: 1rem;
      padding: 1.25rem;
      border-radius: 1.25rem;
      background: rgba(255, 255, 255, 0.76);
      border: 1px solid rgba(15, 23, 42, 0.08);
      box-shadow: 0 20px 45px rgba(15, 23, 42, 0.06);
    }

    .feature-card-wide {
      grid-column: 1 / -1;
    }

    .empty-state {
      padding: 1rem;
      border-radius: 0.85rem;
      background: rgba(248, 250, 252, 0.9);
      border: 1px dashed rgba(100, 116, 139, 0.35);
    }

    .patient-badge {
      padding: 0.9rem 1rem;
      border-radius: 0.9rem;
      background: rgba(15, 23, 42, 0.04);
      border: 1px solid rgba(15, 23, 42, 0.08);
    }

    .history-count {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.35rem 0.75rem;
      border-radius: 999px;
      background: rgba(15, 23, 42, 0.06);
      font-size: 0.85rem;
      color: #334155;
      white-space: nowrap;
    }

    .visit-form {
      display: grid;
      gap: 1rem;
    }

    .table {
      margin-bottom: 0;
    }

    .table th {
      color: #475569;
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      border-bottom-color: rgba(148, 163, 184, 0.35);
    }

    @media (max-width: 1080px) {
      .grid-layout {
        grid-template-columns: 1fr;
      }

      .feature-card-wide {
        grid-column: auto;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisitsPage {
  private readonly fb = inject(FormBuilder);
  protected readonly visitForm = this.fb.nonNullable.group({
    patientId: ['', Validators.required],
    date: [this.todayInputValue(), Validators.required],
    diagnosis: ['', [Validators.required, Validators.minLength(3)]],
    medications: [''],
    treatments: [''],
    documents: [''],
  });

  private readonly patientService = inject(PatientService);
  private readonly visitService = inject(VisitService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly patients = signal<Patient[]>([]);
  protected readonly history = signal<Visit[]>([]);
  protected readonly selectedPatientId = signal<number | null>(null);
  protected readonly historyLoading = signal(false);
  protected readonly saving = signal(false);
  protected readonly error = signal('');
  protected readonly editingVisitId = signal<number | null>(null);

  protected readonly selectedPatient = computed(() => {
    const patientId = this.selectedPatientId();
    return this.patients().find((patient) => patient.id === patientId) ?? null;
  });

  constructor() {
    this.loadPatients();

    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const value = params.get('patientId');

      if (!value) {
        return;
      }

      this.selectPatient(value);
    });

    this.visitForm.controls.patientId.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      const numericId = Number(value);

      if (Number.isFinite(numericId) && numericId > 0) {
        this.selectedPatientId.set(numericId);
        this.loadHistory(numericId);
        return;
      }

      this.selectedPatientId.set(null);
      this.history.set([]);
    });
  }

  protected selectPatient(value: string): void {
    this.visitForm.controls.patientId.setValue(value);
  }

  protected saveVisit(): void {
    if (this.visitForm.invalid) {
      this.visitForm.markAllAsTouched();
      return;
    }

    const { patientId, ...visitData } = this.visitForm.getRawValue();
    const numericPatientId = Number(patientId);

    if (!Number.isFinite(numericPatientId) || numericPatientId <= 0) {
      this.error.set('A beteg kiválasztása kötelező.');
      return;
    }

    this.saving.set(true);
    this.error.set('');

    const editingId = this.editingVisitId();

    if (editingId) {
      const payload: Partial<Visit> = {
        id: editingId,
        ...visitData,
        patient: { id: numericPatientId },
      };

      this.visitService.update(payload).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.saving.set(false);
          this.cancelEditVisit();
          this.resetForm({ keepPatient: true });
          this.loadHistory(numericPatientId);
        },
        error: () => {
          this.saving.set(false);
          this.error.set('A vizit mentése nem sikerült.');
        },
      });

      return;
    }

    this.visitService
      .create({
        ...visitData,
        patient: { id: numericPatientId },
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.resetForm({ keepPatient: true });
          this.loadHistory(numericPatientId);
        },
        error: () => {
          this.saving.set(false);
          this.error.set('A vizit mentése nem sikerült.');
        },
      });
  }

  protected startEditVisit(visit: Visit): void {
    this.editingVisitId.set(visit.id ?? null);
    this.visitForm.reset({
      patientId: String(visit.patient?.id ?? ''),
      date: this.formatDate(visit.date),
      diagnosis: visit.diagnosis,
      medications: visit.medications,
      treatments: visit.treatments,
      documents: visit.documents ?? '',
    });
  }

  protected cancelEditVisit(): void {
    this.editingVisitId.set(null);
  }

  protected deleteVisit(visit: Visit): void {
    if (!visit.id) {
      return;
    }

    if (!globalThis.confirm(`Biztosan törlöd ezt a vizitet: ${visit.diagnosis}?`)) {
      return;
    }

    this.visitService.delete(visit.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        const currentPatientId = this.selectedPatientId();
        if (currentPatientId) {
          this.loadHistory(currentPatientId);
        }
      },
      error: () => {
        this.error.set('A vizit törlése nem sikerült.');
      },
    });
  }

  protected resetForm(options: { keepPatient?: boolean } = {}): void {
    const patientId = options.keepPatient ? this.visitForm.controls.patientId.value : '';

    this.visitForm.reset({
      patientId,
      date: this.todayInputValue(),
      diagnosis: '',
      medications: '',
      treatments: '',
      documents: '',
    });
  }

  protected formatDate(value: string): string {
    return value ? value.slice(0, 10) : 'Nincs megadva';
  }

  protected trackByPatient(_: number, patient: Patient): number | string {
    return patient.id ?? patient.taj;
  }

  protected trackByVisit(_: number, visit: Visit): number | string {
    return visit.id ?? `${visit.date}-${visit.diagnosis}`;
  }

  private loadPatients(): void {
    this.patientService.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (patients) => {
        this.patients.set(patients);
      },
      error: () => {
        this.error.set('A beteglista betöltése nem sikerült.');
      },
    });
  }

  private loadHistory(patientId: number): void {
    this.historyLoading.set(true);
    this.error.set('');

    this.visitService.getHistoryByPatient(patientId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (history) => {
        this.history.set(history);
        this.historyLoading.set(false);
      },
      error: () => {
        this.historyLoading.set(false);
        this.error.set('A kórtörténet betöltése nem sikerült.');
      },
    });
  }

  private todayInputValue(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
