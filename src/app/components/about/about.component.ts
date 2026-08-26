import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../services/language.service';
import { images, Lang, L, milestones, pillars } from '../../data/content';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent implements OnDestroy {
  images = images;
  pillars = pillars;
  milestones = milestones;
  lang: Lang = this.language.current;
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
