import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../services/language.service';
import { images, Lang, L, services } from '../../data/content';

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss'],
})
export class ServicesComponent implements OnDestroy {
  services = services;
  lang: Lang = this.language.current;
  reasons = [
    { index: '01', title: 'SERVICES_PAGE.WHY_1', body: 'SERVICES_PAGE.WHY_1V', image: images.boardroom },
    { index: '02', title: 'SERVICES_PAGE.WHY_2', body: 'SERVICES_PAGE.WHY_2V', image: images.logistics },
    { index: '03', title: 'SERVICES_PAGE.WHY_3', body: 'SERVICES_PAGE.WHY_3V', image: images.sea },
  ];
  private sub: Subscription;

  constructor(public language: LanguageService) {
    this.sub = this.language.languageChanged$.subscribe((lang) => (this.lang = lang));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  txt(copy: L): string {
    return copy[this.lang];
  }
}
