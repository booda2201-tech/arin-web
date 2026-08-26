import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, ViewChild } from '@angular/core';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../services/language.service';
import {
  images,
  Lang,
  L,
  mapNodes,
  mapRoutes,
  processSteps,
  services,
  telemetry,
} from '../../data/content';

type Node = { id: string; label: L; x: number; y: number; hub?: boolean };

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  @ViewChild('homeRoot', { static: true }) homeRoot!: ElementRef<HTMLElement>;
  @ViewChild('chamber', { static: true }) chamber!: ElementRef<HTMLElement>;

  images = images;
  telemetry = telemetry;
  services = services;
  processSteps = processSteps;
  nodes = mapNodes;
  routes = mapRoutes;
  lang: Lang = this.language.current;
  private ctx?: ReturnType<typeof gsap.context>;
  private sub: Subscription;

  constructor(public language: LanguageService, private zone: NgZone) {
    this.sub = this.language.languageChanged$.subscribe((lang) => {
      this.lang = lang;
      this.zone.runOutsideAngular(() => setTimeout(() => ScrollTrigger.refresh(), 80));
    });
  }

  ngAfterViewInit(): void {
    document.body.classList.add('on-home');
    this.zone.runOutsideAngular(() => {
      const ready = document.fonts?.ready ?? Promise.resolve();
      void ready.then(() => this.bootMotion());
    });
  }

  ngOnDestroy(): void {
    document.body.classList.remove('on-home');
    this.ctx?.revert();
    this.sub.unsubscribe();
  }

  txt(copy: L): string {
    return copy[this.lang];
  }

  nodeById(id: string): Node {
    return this.nodes.find((n) => n.id === id) as Node;
  }

  arc(from: string, to: string): string {
    const a = this.nodeById(from);
    const b = this.nodeById(to);
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2 - Math.abs(b.x - a.x) * 0.22 - 20;
    return `M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`;
  }

  private bootMotion(): void {
    this.ctx?.revert();
    const root = this.homeRoot.nativeElement;
    const chamber = this.chamber.nativeElement;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const chapterEl = root.querySelector('.film-rail-num');
    const chapterMap: Record<string, string> = {
      open: '01',
      dive: '01',
      origin: '02',
      manifesto: '03',
      reach: '04',
      journey: '05',
      capa: '06',
      proof: '07',
      end: '08',
    };

    this.ctx = gsap.context(() => {
      if (reduce) {
        return;
      }

      const rooms = gsap.utils.toArray<HTMLElement>('.chamber-room');
      const track = root.querySelector('.services-track') as HTMLElement | null;
      const viewport = root.querySelector('.services-viewport') as HTMLElement | null;
      const cards = gsap.utils.toArray<HTMLElement>('.journey-card');

      gsap.set('.hero-line-inner', { yPercent: 105 });
      gsap.set('.hero-sub, .hero-scroll, .house-plaque', { autoAlpha: 0, y: 16 });
      gsap.set(rooms, { autoAlpha: 0, y: 12, pointerEvents: 'none' });

      gsap
        .timeline({ defaults: { ease: 'power2.out' } })
        .to('.hero-line-inner', { yPercent: 0, duration: 0.95, stagger: 0.1 })
        .to('.hero-sub, .house-plaque', { autoAlpha: 1, y: 0, duration: 0.55 }, '-=0.4')
        .to('.hero-scroll', { autoAlpha: 1, y: 0, duration: 0.4 }, '-=0.25');

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: chamber,
          start: 'top top',
          end: () => '+=' + Math.round(window.innerHeight * 14),
          pin: true,
          scrub: 1.25,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const fill = root.querySelector('.film-rail-fill');
            if (fill) {
              gsap.set(fill, { scaleY: self.progress });
            }
            const label = tl.currentLabel();
            if (chapterEl && label && chapterMap[label]) {
              chapterEl.textContent = chapterMap[label];
            }
          },
        },
      });

      const openRoom = (index: number, label: string, hold = 1.65) => {
        const room = rooms[index];
        const prev = index > 0 ? rooms[index - 1] : null;
        tl.addLabel(label);
        tl.to(room, { autoAlpha: 1, y: 0, duration: 1.45, ease: 'none' });
        tl.set(room, { pointerEvents: 'auto' }, '<');
        if (prev) {
          tl.to(prev, { autoAlpha: 0, duration: 1.45, ease: 'none' }, '<');
          tl.set(prev, { pointerEvents: 'none' }, '>');
        }
        tl.to({}, { duration: hold });
      };

      tl.addLabel('open');
      tl.to('.chamber-hero, .house-plaque', { autoAlpha: 0, duration: 1.2, ease: 'none' }, 0);
      tl.to('.chamber-photo', { scale: 1.28, duration: 2.1, ease: 'none' }, 0);

      tl.addLabel('dive');
      tl.to('.chamber-photo', { scale: 1.5, duration: 1.3, ease: 'none' });
      tl.to('.chamber-shade', { autoAlpha: 0.88, duration: 1.3, ease: 'none' }, '<');

      openRoom(0, 'origin', 1.7);
      tl.to('.chamber-world', { autoAlpha: 0, duration: 1.45, ease: 'none' }, 'origin');

      openRoom(1, 'manifesto', 1.7);
      openRoom(2, 'reach', 1.8);
      tl.from(
        '.map-route, .map-route-head',
        { drawSVG: 0, stagger: 0.08, duration: 1.2, ease: 'none', immediateRender: false },
        'reach+=0.25'
      );

      openRoom(3, 'journey', 0.9);
      if (cards.length) {
        tl.set(cards, { autoAlpha: 0, y: 0 }, 'journey');
        tl.set(cards[0], { autoAlpha: 1 }, 'journey');
        cards.forEach((card, i) => {
          if (i === 0) {
            return;
          }
          tl.to(cards[i - 1], { autoAlpha: 0, duration: 0.85, ease: 'none' });
          tl.to(card, { autoAlpha: 1, duration: 0.85, ease: 'none' }, '<');
          tl.to({}, { duration: 1.15 });
        });
      }

      openRoom(4, 'capa', 0.9);
      if (track && viewport) {
        tl.to(track, {
          x: () => {
            if (window.innerWidth < 900) {
              return 0;
            }
            return Math.min(0, viewport.clientWidth - track.scrollWidth);
          },
          duration: 2.4,
          ease: 'none',
        });
        tl.to({}, { duration: 0.7 });
      }

      openRoom(5, 'proof', 1.7);
      openRoom(6, 'end', 1.5);
    }, root);

    requestAnimationFrame(() => ScrollTrigger.refresh());
  }
}
