import { AfterViewInit, Component, HostListener, NgZone, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { LanguageService } from '../../services/language.service';
import { AuthService } from '../../services/auth.service';
import { navItems, site } from '../../data/content';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements AfterViewInit, OnDestroy {
  site = site;
  navItems = navItems;
  scrolled = false;
  hidden = false;
  open = false;
  currentLang = this.language.current;
  currentUrl = this.router.url.split('?')[0].split('#')[0];
  private lastY = 0;
  private sub: Subscription;
  private scrollTicking = false;
  private offScroll?: () => void;
  private offResize?: () => void;

  constructor(
    public language: LanguageService,
    public auth: AuthService,
    private router: Router,
    private zone: NgZone
  ) {
    this.sub = this.language.languageChanged$.subscribe((lang) => (this.currentLang = lang));
    this.router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd)).subscribe((e) => {
      this.currentUrl = e.urlAfterRedirects.split('?')[0].split('#')[0];
      this.hidden = false;
      this.lastY = 0;
      this.close();
    });
  }

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      const onScroll = () => {
        if (this.scrollTicking) {
          return;
        }
        this.scrollTicking = true;
        requestAnimationFrame(() => {
          this.scrollTicking = false;
          this.updateScrollState();
        });
      };
      const onResize = () => {
        if (this.open && window.innerWidth >= 1024) {
          this.zone.run(() => this.close());
        }
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onResize, { passive: true });
      this.offScroll = () => window.removeEventListener('scroll', onScroll);
      this.offResize = () => window.removeEventListener('resize', onResize);
      this.updateScrollState();
    });
  }

  ngOnDestroy(): void {
    this.close();
    this.sub.unsubscribe();
    this.offScroll?.();
    this.offResize?.();
  }

  private updateScrollState(): void {
    const y = Math.max(0, window.scrollY || 0);
    const scrolled = y > 24;
    let hidden = this.hidden;

    if (this.open || y < 48) {
      hidden = false;
      this.lastY = y;
      if (this.scrolled !== scrolled || this.hidden !== hidden) {
        this.zone.run(() => {
          this.scrolled = scrolled;
          this.hidden = hidden;
        });
      }
      return;
    }

    const delta = y - this.lastY;
    if (delta > 6) {
      hidden = true;
    } else if (delta < -6) {
      hidden = false;
    }
    this.lastY = y;
    if (this.scrolled !== scrolled || this.hidden !== hidden) {
      this.zone.run(() => {
        this.scrolled = scrolled;
        this.hidden = hidden;
      });
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

  logout(): void {
    this.auth.logout();
    this.close();
    this.router.navigate(['/']);
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
