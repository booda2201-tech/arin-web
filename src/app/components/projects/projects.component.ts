import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../services/language.service';
import { Lang, L, projects } from '../../data/content';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss'],
})
export class ProjectsComponent implements OnDestroy {
  projects = projects;
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
