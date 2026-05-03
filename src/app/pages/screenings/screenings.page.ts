import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { ScreeningRow } from '../../models/screening.model';
import { ScreeningService } from '../../services/screening.service';

@Component({
  selector: 'app-screenings-page',
  template: `
    <section class="page-stack">
      <header class="page-intro">
        <h2>Érintett páciensek listája</h2>
        <p>A lista a backend által számolt, életkor- és nemalapú szűrővizsgálatokat jeleníti meg.</p>
      </header>

      @if (error()) {
        <div class="alert alert-danger mb-0" role="alert">{{ error() }}</div>
      }

      <article class="feature-card">
        <div class="d-flex justify-content-between gap-3 flex-wrap align-items-start">
          <span class="history-count">{{ screeningCount() }} beteg</span>
        </div>

        @if (loading()) {
          <div class="text-secondary py-3">Szűrővizsgálatok betöltése...</div>
        } @else if (screenings().length === 0) {
          <div class="empty-state">Jelenleg nincs a rendszerben olyan beteg, akihez szűrővizsgálat tartozna.</div>
        } @else {
          <div class="table-responsive">
            <table class="table align-middle mb-0">
              <thead>
                <tr>
                  <th>Név</th>
                  <th>TAJ</th>
                  <th>Életkor</th>
                  <th>Előírt szűrések</th>
                </tr>
              </thead>
              <tbody>
                @for (row of screenings(); track trackByScreening($index, row)) {
                  <tr>
                    <td class="fw-semibold">{{ row.name }}</td>
                    <td>{{ row.taj }}</td>
                    <td>{{ row.age }} év</td>
                    <td>
                      <div class="screening-tags">
                        @for (screening of row.screenings; track screening) {
                          <span class="badge text-bg-light border">{{ screening }}</span>
                        }
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </article>
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

    .feature-card {
      display: grid;
      gap: 1rem;
      padding: 1.25rem;
      border-radius: 1.25rem;
      background: rgba(255, 255, 255, 0.76);
      border: 1px solid rgba(15, 23, 42, 0.08);
      box-shadow: 0 20px 45px rgba(15, 23, 42, 0.06);
    }

    .empty-state {
      padding: 1rem;
      border-radius: 0.85rem;
      background: rgba(248, 250, 252, 0.9);
      border: 1px dashed rgba(100, 116, 139, 0.35);
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

    .screening-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
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
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScreeningsPage {
  private readonly screeningService = inject(ScreeningService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly screenings = signal<ScreeningRow[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal('');

  protected readonly screeningCount = computed(() => this.screenings().length);

  constructor() {
    this.loadScreenings();
  }

  protected trackByScreening(_: number, row: ScreeningRow): string {
    return `${row.taj}-${row.name}`;
  }

  private loadScreenings(): void {
    this.screeningService.getScreenings().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (rows) => {
        this.screenings.set(rows);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('A szűrővizsgálati lista betöltése nem sikerült.');
      },
    });
  }
}
