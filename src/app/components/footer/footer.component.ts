import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../services/language.service';
import { mailHref, navItems, services, site, telHref, whatsappHref } from '../../data/content';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnDestroy {
  site = site;
  navItems = navItems;
  services = services;
  year = new Date().getFullYear();
  email = '';
  sent = false;
  currentLang = this.language.current;
  tel = telHref();
  mail = mailHref();
  wa = whatsappHref();
  private sub: Subscription;

  constructor(public language: LanguageService) {
    this.sub = this.language.languageChanged$.subscribe((lang) => (this.currentLang = lang));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  subscribe(event: Event): void {
    event.preventDefault();
    if (this.email.includes('@')) {
      this.sent = true;
    }
  }
}
