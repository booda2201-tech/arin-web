import { AfterViewInit, Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AnimationsService } from './services/animations.service';
import { LanguageService } from './services/language.service';
import { SeoService } from './services/seo.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  currentUrl = '';

  constructor(
    private router: Router,
    private language: LanguageService,
    private seo: SeoService,
    private animations: AnimationsService
  ) {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        this.currentUrl = e.urlAfterRedirects.split('?')[0].split('#')[0];
      });
  }

  get isAuthOrAdmin(): boolean {
    return this.currentUrl === '/login' || this.currentUrl.startsWith('/admin');
  }

  ngAfterViewInit(): void {
    this.language.current;
    this.seo.init();
    this.animations.initAos();
  }
}
