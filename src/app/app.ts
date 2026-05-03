import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="app-shell">
      <header class="shell-header">
        <div class="brand-block">
          <h1>{{ title() }}</h1>
          <p class="brand-copy">
            Betegnyilvántartás, vizitek és szűrővizsgálatok egyetlen kezelőfelületen.
          </p>
        </div>

        <nav class="shell-nav" aria-label="Fő navigáció">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Kezdőlap</a>
          <a routerLink="/patients" routerLinkActive="active">Betegek</a>
          <a routerLink="/visits" routerLinkActive="active">Vizitek</a>
          <a routerLink="/screenings" routerLinkActive="active">Szűrővizsgálatok</a>
        </nav>
      </header>

      <main class="shell-main">

        <section class="content-panel" aria-label="Oldal tartalma">
          <router-outlet />
        </section>
      </main>
    </div>
  `,
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  protected readonly title = signal('Orvosi törzsadat kezelés');
}
