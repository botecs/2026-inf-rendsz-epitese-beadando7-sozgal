import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import type { Patient } from '../../models/patient.model';
import { PatientService } from '../../services/patient.service';

@Component({
  selector: 'app-patients-page',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="page-stack">
      <header class="page-intro">
        <h2>Betegnyilvántartás</h2>
        <p>Kereshető lista, szerkeszthető űrlap és gyors ugrás a beteghez tartozó vizitekhez.</p>
      </header>

      @if (error()) {
        <div class="alert alert-danger mb-0" role="alert">{{ error() }}</div>
      }

      <div class="grid-layout">
        <article class="feature-card">
          <div class="card-header-row">
            <div>
              <h3>Aktív betegek</h3>
            </div>

            <label class="search-box">
              <span class="visually-hidden">Keresés</span>
              <input
                #searchInput
                type="search"
                class="form-control"
                placeholder="Név vagy TAJ alapján"
                [value]="searchTerm()"
                (input)="onSearch(searchInput.value)"
              />
            </label>
          </div>

          @if (loading()) {
            <div class="text-secondary py-3">Betegek betöltése...</div>
          } @else if (filteredPatients().length === 0) {
            <div class="empty-state">Nincs a keresésnek megfelelő beteg.</div>
          } @else {
            <div class="table-responsive">
              <table class="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Név</th>
                    <th>TAJ</th>
                    <th>Születési dátum</th>
                    <th>Nem</th>
                    <th class="text-end">Műveletek</th>
                  </tr>
                </thead>
                <tbody>
                  @for (patient of filteredPatients(); track trackByPatient($index, patient)) {
                    <tr>
                      <td><div class="fw-semibold">{{ patient.name }}</div></td>
                      <td>{{ patient.taj }}</td>
                      <td>{{ formatDate(patient.birthDate) }}</td>
                      <td>{{ genderLabel(patient.gender) }}</td>
                      <td>
                        <div class="d-flex justify-content-end gap-2 flex-wrap">
                          <a
                            class="btn btn-outline-primary btn-sm"
                            [routerLink]="['/visits']"
                            [queryParams]="{ patientId: patient.id }"
                          >
                            Vizitek
                          </a>
                          <button type="button" class="btn btn-outline-secondary btn-sm" (click)="startEdit(patient)">
                            Szerkesztés
                          </button>
                          <button type="button" class="btn btn-outline-danger btn-sm" (click)="deletePatient(patient)">
                            Törlés
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </article>

        <article class="feature-card">
          <div>
            <h3>{{ editingPatientId() ? 'Beteg módosítása' : 'Új beteg felvétele' }}</h3>
          </div>

          <form class="patient-form" [formGroup]="patientForm" (ngSubmit)="savePatient()">
            <div>
              <label class="form-label" for="patient-name">Név</label>
              <input id="patient-name" class="form-control" formControlName="name" type="text" />
              @if (patientForm.controls.name.touched && patientForm.controls.name.invalid) {
                <div class="text-danger small mt-1">A név megadása kötelező.</div>
              }
            </div>

            <div>
              <label class="form-label" for="patient-taj">TAJ</label>
              <input
                id="patient-taj"
                class="form-control"
                formControlName="taj"
                type="text"
                inputmode="numeric"
                maxlength="9"
              />
              @if (patientForm.controls.taj.touched && patientForm.controls.taj.invalid) {
                <div class="text-danger small mt-1">A TAJ-nak 9 számjegyből kell állnia.</div>
              }
            </div>

            <div>
              <label class="form-label" for="patient-birthDate">Születési dátum</label>
              <input id="patient-birthDate" class="form-control" formControlName="birthDate" type="date" />
              @if (patientForm.controls.birthDate.touched && patientForm.controls.birthDate.invalid) {
                <div class="text-danger small mt-1">A születési dátum megadása kötelező.</div>
              }
            </div>

            <div>
              <label class="form-label" for="patient-gender">Nem</label>
              <select id="patient-gender" class="form-select" formControlName="gender">
                @for (option of genderOptions; track option.value) {
                  <option [value]="option.value">{{ option.label }}</option>
                }
              </select>
            </div>

            <div class="d-flex gap-2 flex-wrap">
              <button class="btn btn-primary" type="submit" [disabled]="saving()">
                {{ saving() ? 'Mentés...' : editingPatientId() ? 'Módosítás mentése' : 'Beteg létrehozása' }}
              </button>
              @if (editingPatientId()) {
                <button class="btn btn-outline-secondary" type="button" (click)="cancelEdit()">Mégse</button>
              }
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
      grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr);
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

    .card-header-row {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      align-items: end;
      flex-wrap: wrap;
    }

    .search-box {
      min-width: min(100%, 280px);
    }

    .patient-form {
      display: grid;
      gap: 1rem;
    }

    .empty-state {
      padding: 1rem;
      border-radius: 0.85rem;
      background: rgba(248, 250, 252, 0.9);
      border: 1px dashed rgba(100, 116, 139, 0.35);
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
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientsPage {
  protected readonly genderOptions = [
    { value: 'male', label: 'Férfi' },
    { value: 'female', label: 'Nő' },
  ];

  private readonly fb = inject(FormBuilder);
  protected readonly patientForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    taj: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
    birthDate: ['', Validators.required],
    gender: ['female', Validators.required],
  });

  private readonly patientService = inject(PatientService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly patients = signal<Patient[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly error = signal('');
  protected readonly searchTerm = signal('');
  protected readonly editingPatientId = signal<number | null>(null);

  protected readonly filteredPatients = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();
    const patients = this.patients();

    if (!search) {
      return patients;
    }

    return patients.filter((patient) => {
      return (
        patient.name.toLowerCase().includes(search) ||
        patient.taj.toLowerCase().includes(search) ||
        this.genderLabel(patient.gender).toLowerCase().includes(search)
      );
    });
  });

  constructor() {
    this.loadPatients();
  }

  protected onSearch(value: string): void {
    this.searchTerm.set(value);
  }

  protected startEdit(patient: Patient): void {
    this.editingPatientId.set(patient.id ?? null);
    this.patientForm.reset({
      name: patient.name,
      taj: patient.taj,
      birthDate: this.toDateInputValue(patient.birthDate),
      gender: patient.gender,
    });
  }

  protected cancelEdit(): void {
    this.editingPatientId.set(null);
    this.patientForm.reset({
      name: '',
      taj: '',
      birthDate: '',
      gender: 'female',
    });
  }

  protected savePatient(): void {
    if (this.patientForm.invalid) {
      this.patientForm.markAllAsTouched();
      return;
    }

    const payload = this.patientForm.getRawValue();
    const patientId = this.editingPatientId();

    this.saving.set(true);
    this.error.set('');

    const request$ = patientId
      ? this.patientService.update({ id: patientId, ...payload })
      : this.patientService.create(payload);

    request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.saving.set(false);
        this.cancelEdit();
        this.loadPatients();
      },
      error: () => {
        this.saving.set(false);
        this.error.set('A beteg mentése sikertelen volt.');
      },
    });
  }

  protected deletePatient(patient: Patient): void {
    if (!patient.id) {
      return;
    }

    if (!globalThis.confirm(`Biztosan törlöd ezt a beteget: ${patient.name}?`)) {
      return;
    }

    this.patientService.delete(patient.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        if (this.editingPatientId() === patient.id) {
          this.cancelEdit();
        }

        this.loadPatients();
      },
      error: () => {
        this.error.set('A beteg törlése nem sikerült.');
      },
    });
  }

  protected formatDate(value: string): string {
    return this.toDateInputValue(value) || 'Nincs megadva';
  }

  protected genderLabel(value: string): string {
    return this.genderOptions.find((option) => option.value === value)?.label ?? value;
  }

  protected trackByPatient(_: number, patient: Patient): number | string {
    return patient.id ?? patient.taj;
  }

  private loadPatients(): void {
    this.loading.set(true);
    this.error.set('');

    this.patientService.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (patients) => {
        this.patients.set(patients);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('A beteglista betöltése nem sikerült.');
      },
    });
  }

  private toDateInputValue(value: string): string {
    return value ? value.slice(0, 10) : '';
  }
}
