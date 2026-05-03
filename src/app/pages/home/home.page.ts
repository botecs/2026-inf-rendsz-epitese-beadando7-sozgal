import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-home-page',
  template: `
    <article class="page-card">
      <h3>Fő munkaterület</h3>
      <p>
        A rendszer jelenleg a betegnyilvántartás, vizitkezelés és szűrővizsgálati
        folyamatok előkészítésére szolgál.
      </p>
      <div class="page-metrics">
        <div>
          <strong>Betegek</strong>
          <span>nyilvántartás és szerkesztés</span>
        </div>
        <div>
          <strong>Vizitek</strong>
          <span>kórtörténet és új bejegyzés</span>
        </div>
        <div>
          <strong>Szűrések</strong>
          <span>életkor- és nemalapú lista</span>
        </div>
      </div>
    </article>
  `,
  styles: `
    .page-card {
      display: grid;
      gap: 1rem;
    }

    h3 {
      margin: 0;
      font-size: 1.5rem;
    }

    p {
      margin: 0;
      color: #374151;
      line-height: 1.6;
    }

    .page-metrics {
      display: grid;
      gap: 0.75rem;
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .page-metrics div {
      padding: 1rem;
      border-radius: 1rem;
      background: rgba(255, 255, 255, 0.72);
      border: 1px solid rgba(15, 23, 42, 0.08);
    }

    strong {
      display: block;
      margin-bottom: 0.35rem;
      color: #0f172a;
    }

    span {
      display: block;
      color: #475569;
      font-size: 0.95rem;
    }

    @media (max-width: 720px) {
      .page-metrics {
        grid-template-columns: 1fr;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePage {}
