import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../services/language.service';
import { images, labSteps, Lang, L } from '../../data/content';

@Component({
  selector: 'app-private-label',
  templateUrl: './private-label.component.html',
  styleUrls: ['./private-label.component.scss'],
})
export class PrivateLabelComponent implements OnDestroy {
  images = images;
  steps = labSteps;
  lang: Lang = this.language.current;
  deliverables: { title: L; body: L }[] = [
    {
      title: { ar: 'موجز المنتج', en: 'Product brief' },
      body: { ar: 'مواصفات وجمهور ونقطة تميز قابلة للقياس.', en: 'Spec, audience and a measurable difference.' },
    },
    {
      title: { ar: 'عينة معتمدة', en: 'Approved sample' },
      body: { ar: 'اختبارات جودة قبل الإنتاج التجاري.', en: 'Quality checks before commercial production.' },
    },
    {
      title: { ar: 'هوية متماسكة', en: 'Coherent identity' },
      body: { ar: 'اسم وعبوة ورسائل تساعد المنتج على الوقوف وحده.', en: 'Name, pack and messages that stand alone.' },
    },
    {
      title: { ar: 'خطة توريد', en: 'Supply plan' },
      body: { ar: 'كميات أولية ومهلات ومسار شحن.', en: 'Initial volumes, lead times and a freight path.' },
    },
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
