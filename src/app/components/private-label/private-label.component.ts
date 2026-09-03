import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy } from '@angular/core';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../services/language.service';
import {
  images,
  labSteps,
  Lang,
  L,
  privateLabelDeliverables,
  privateLabelFaq,
  privateLabelLines,
  privateLabelPromises,
  privateLabelSeals,
  privateLabelStats,
} from '../../data/content';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-private-label',
  templateUrl: './private-label.component.html',
  styleUrls: ['./private-label.component.scss'],
})
export class PrivateLabelComponent implements AfterViewInit, OnDestroy {
  images = images;
  steps = labSteps;
  stats = privateLabelStats;
  promises = privateLabelPromises;
  lines = privateLabelLines;
  deliverables = privateLabelDeliverables;
  seals = privateLabelSeals;
  faqs = privateLabelFaq;
  lang: Lang = this.language.current;
  openFaq = 0;

  private sub: Subscription;
  private ctx?: ReturnType<typeof gsap.context>;

  constructor(
    public language: LanguageService,
    private host: ElementRef<HTMLElement>,
    private zone: NgZone
  ) {
    this.sub = this.language.languageChanged$.subscribe((lang) => {
      this.lang = lang;
      this.zone.runOutsideAngular(() => setTimeout(() => ScrollTrigger.refresh(), 80));
    });
  }

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      const ready = document.fonts?.ready ?? Promise.resolve();
      void ready.then(() => this.bootMotion());
    });
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
    this.sub.unsubscribe();
  }

  txt(copy: L): string {
    return copy[this.lang];
  }

  toggleFaq(index: number): void {
    this.openFaq = this.openFaq === index ? -1 : index;
  }

  private bootMotion(): void {
    this.ctx?.revert();
    const root = this.host.nativeElement;

    this.ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.set('.pl-title-line', { yPercent: 110 });
        gsap.set('.pl-hero-fade, .pl-stat, .pl-scroll', { autoAlpha: 0, y: 18 });

        gsap
          .timeline({ defaults: { ease: 'power3.out' } })
          .to('.pl-title-line', { yPercent: 0, duration: 1.05, stagger: 0.12 })
          .to('.pl-hero-fade', { autoAlpha: 1, y: 0, duration: 0.7 }, '-=0.45')
          .to('.pl-stat', { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.08 }, '-=0.35')
          .to('.pl-scroll', { autoAlpha: 1, y: 0, duration: 0.4 }, '-=0.2');

        mm.add('(min-width: 768px)', () => {
          gsap.to('.pl-stage-photo', {
            yPercent: 12,
            ease: 'none',
            scrollTrigger: {
              trigger: '.pl-stage',
              start: 'top top',
              end: 'bottom top',
              scrub: 0.8,
            },
          });
        });

        gsap.utils.toArray<HTMLElement>('.pl-rise').forEach((el) => {
          gsap.from(el, {
            autoAlpha: 0,
            y: 32,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 86%',
              once: true,
            },
          });
        });

        const line = root.querySelector('.pl-path-line') as HTMLElement | null;
        if (line) {
          gsap.fromTo(
            line,
            { scaleX: 0 },
            {
              scaleX: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: '.pl-path-track',
                start: 'top 72%',
                end: 'bottom 55%',
                scrub: 0.7,
              },
            }
          );
        }

        gsap.utils.toArray<HTMLElement>('.pl-step').forEach((el, i) => {
          gsap.from(el, {
            autoAlpha: 0,
            y: 24,
            duration: 0.7,
            delay: i * 0.04,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
              once: true,
            },
          });
        });
      });
    }, root);

    requestAnimationFrame(() => ScrollTrigger.refresh());
  }
}
