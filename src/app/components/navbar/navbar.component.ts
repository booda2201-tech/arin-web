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
  hidden = false;
  open = false;
  currentLang = this.language.current;
  currentUrl = this.router.url.split('?')[0].split('#')[0];
  private lastY = 0;
  private sub: Subscription;

  constructor(
    public language: LanguageService,
    private router: Router
  ) {
    this.sub = this.language.languageChanged$.subscribe((lang) => (this.currentLang = lang));
    this.router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd)).subscribe((e) => {
      this.currentUrl = e.urlAfterRedirects.split('?')[0].split('#')[0];
      this.hidden = false;
      this.lastY = 0;
      this.close();
    });
  }

  ngOnDestroy(): void {
    this.close();
    this.sub.unsubscribe();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    const y = Math.max(0, window.scrollY || 0);
    this.scrolled = y > 24;

    if (this.open || y < 48) {
      this.hidden = false;
      this.lastY = y;
      return;
    }

    const delta = y - this.lastY;
    if (delta > 6) {
      this.hidden = true;
    } else if (delta < -6) {
      this.hidden = false;
    }
    this.lastY = y;
  }

  @HostListener('window:resize')
  onResize(): void {
    if (this.open && window.innerWidth >= 1024) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }

  isHome(): boolean {
    return this.currentUrl === '/';
  }

  isCurrent(path: string): boolean {
    return path === '/' ? this.currentUrl === '/' : this.currentUrl === path || this.currentUrl.startsWith(path + '/');
  }

  label(item: (typeof navItems)[number]): string {
    return item.label[this.currentLang];
  }

  indexOf(i: number): string {
    return String(i + 1).padStart(2, '0');
  }

  toggle(): void {
    this.open ? this.close() : this.openMenu();
  }

  openMenu(): void {
    this.open = true;
    document.body.classList.add('nav-open');
  }

  close(): void {
    this.open = false;
    document.body.classList.remove('nav-open');
  }
}
