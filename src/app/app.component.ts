import { AfterViewInit, Component } from '@angular/core';
import { AnimationsService } from './services/animations.service';
import { LanguageService } from './services/language.service';
import { SeoService } from './services/seo.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  constructor(
    private language: LanguageService,
    private seo: SeoService,
    private animations: AnimationsService
  ) {}

  ngAfterViewInit(): void {
    this.language.current;
    this.seo.init();
    this.animations.initAos();
  }
}
