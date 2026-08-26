import { Component, HostListener, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { LanguageService } from '../../services/language.service';
import { navItems, site } from '../../data/content';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnDestroy {
  site = site;
  navItems = navItems;
  scrolled = false;
  open = false;
  currentLang = this.language.current;
  private sub: Subscription;

  constructor(
    public language: LanguageService,
    private router: Router
  ) {
    this.sub = this.language.languageChanged$.subscribe((lang) => (this.currentLang = lang));
    this.router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd)).subscribe(() => {
      this.open = false;
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled = window.scrollY > 24;
  }

  isHome(): boolean {
    return this.router.url.split('?')[0] === '/';
  }

  label(item: (typeof navItems)[number]): string {
    return item.label[this.currentLang];
  }
}
