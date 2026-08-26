import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Lang } from '../data/content';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private languageSubject = new BehaviorSubject<Lang>('ar');
  languageChanged$ = this.languageSubject.asObservable();

  constructor(private translate: TranslateService) {
    this.translate.setDefaultLang('ar');
    const saved = (localStorage.getItem('lang') as Lang) || 'ar';
    this.switchLanguage(saved === 'en' ? 'en' : 'ar');
  }

  get current(): Lang {
    return this.languageSubject.value;
  }

  switchLanguage(language: Lang): void {
    localStorage.setItem('lang', language);
    this.translate.use(language);
    document.documentElement.setAttribute('lang', language);
    document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
    this.languageSubject.next(language);
  }

  toggle(): void {
    this.switchLanguage(this.current === 'ar' ? 'en' : 'ar');
  }
}
