import { Component, inject, signal } from '@angular/core';
import { Header } from "./pages/header/header";
import { Footer } from "./pages/footer/footer";
import { Router, RouterOutlet } from '@angular/router';


@Component({
  selector: 'app-root',
  imports: [Header, Footer, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('poultry-app');
  showToast = signal<boolean>(false);

  readonly router = inject(Router);
}
