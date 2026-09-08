import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy } from '@angular/core';
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

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  images = images;
  telemetry = telemetry;
  services = services;
  processSteps = processSteps;
  nodes = mapNodes;
  routes = mapRoutes;
  lang: Lang = this.language.current;

  private ctx?: ReturnType<typeof gsap.context>;
  private sub: Subscription;

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
    const root = this.host.nativeElement;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.ctx = gsap.context(() => {
      if (reduce) {
        return;
      }

      // Hero subtle entrance
      gsap.from('.hero-anim', {
        autoAlpha: 0,
        y: 28,
        duration: 0.9,
        stagger: 0.12,
        ease: 'power3.out',
      });

      // Section scroll reveals
      gsap.utils.toArray<HTMLElement>('.reveal-item').forEach((el) => {
        gsap.from(el, {
          autoAlpha: 0,
          y: 32,
          duration: 0.85,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            once: true,
          },
        });
      });

      // Trade route draw animation on map visible
      const mapFrame = root.querySelector('.map-frame');
      if (mapFrame) {
        gsap.from('.map-route, .map-route-head', {
          strokeDashoffset: 1000,
          strokeDasharray: 1000,
          duration: 1.5,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: mapFrame,
            start: 'top 82%',
            once: true,
          },
        });
      }
    }, root);

    requestAnimationFrame(() => ScrollTrigger.refresh());
  }
}
