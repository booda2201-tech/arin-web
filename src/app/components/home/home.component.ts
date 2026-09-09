import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy } from '@angular/core';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../services/language.service';
import {
  images,
  Lang,
  L,
  MapNode,
  mapNodes,
  mapRoutes,
  processSteps,
  services,
  telemetry,
} from '../../data/content';

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
  activeId: string | null = null;
  hitRadius = 28;
  private locked = false;
  private tourTimer?: number;
  private tourIndex = 0;
  private reduceMotion = false;
  private canHover = false;

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

  get destinations(): MapNode[] {
    return this.nodes.filter((n) => !n.hub);
  }

  get activeNode(): MapNode | null {
    return this.activeId ? this.nodeById(this.activeId) : null;
  }

  ngAfterViewInit(): void {
    document.body.classList.add('on-home');
    this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    this.hitRadius = window.matchMedia('(max-width: 767px)').matches ? 34 : 26;
    this.zone.runOutsideAngular(() => {
      const ready = document.fonts?.ready ?? Promise.resolve();
      void ready.then(() => this.bootMotion());
    });
  }

  ngOnDestroy(): void {
    document.body.classList.remove('on-home');
    this.stopTour();
    this.ctx?.revert();
    this.sub.unsubscribe();
  }

  txt(copy: L): string {
    return copy[this.lang];
  }

  nodeById(id: string): MapNode {
    return this.nodes.find((n) => n.id === id) as MapNode;
  }

  arc(from: string, to: string): string {
    const a = this.nodeById(from);
    const b = this.nodeById(to);
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2 - Math.abs(b.x - a.x) * 0.22 - 20;
    return `M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`;
  }

  isRouteLit(route: [string, string]): boolean {
    if (!this.activeId) return false;
    if (this.activeId === 'cairo') return true;
    return route[0] === this.activeId || route[1] === this.activeId;
  }

  isRouteDim(route: [string, string]): boolean {
    return !!this.activeId && !this.isRouteLit(route);
  }

  isNodeDim(id: string): boolean {
    if (!this.activeId) return false;
    if (this.activeId === 'cairo') return false;
    if (id === this.activeId || id === 'cairo') return false;
    const linked = this.routes.some(
      (r) =>
        (r[0] === this.activeId && r[1] === id) ||
        (r[1] === this.activeId && r[0] === id)
    );
    return !linked;
  }

  selectNode(id: string, event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();
    this.locked = true;
    this.stopTour();
    this.zone.run(() => {
      this.activeId = this.activeId === id ? null : id;
      if (!this.activeId) {
        this.locked = false;
        this.startTour();
      }
    });
  }

  previewNode(id: string): void {
    if (!this.canHover || this.locked || this.reduceMotion) return;
    this.stopTour();
    this.zone.run(() => {
      this.activeId = id;
    });
  }

  onMapLeave(): void {
    if (!this.canHover || this.locked) return;
    this.zone.run(() => {
      this.activeId = null;
    });
    this.startTour();
  }

  clearNode(event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();
    this.locked = false;
    this.zone.run(() => {
      this.activeId = null;
    });
    this.startTour();
  }

  private startTour(): void {
    if (this.reduceMotion || this.tourTimer || this.locked) return;
    const destinations = this.nodes.filter((n) => !n.hub);
    this.zone.runOutsideAngular(() => {
      this.tourTimer = window.setInterval(() => {
        const next = destinations[this.tourIndex % destinations.length];
        this.tourIndex += 1;
        this.zone.run(() => {
          this.activeId = next.id;
        });
      }, 3200);
    });
  }

  private stopTour(): void {
    if (this.tourTimer) {
      window.clearInterval(this.tourTimer);
      this.tourTimer = undefined;
    }
  }

  private bootMotion(): void {
    this.ctx?.revert();
    const root = this.host.nativeElement;

    this.ctx = gsap.context(() => {
      if (this.reduceMotion) {
        return;
      }

      gsap.from('.hero-anim', {
        autoAlpha: 0,
        y: 28,
        duration: 0.9,
        stagger: 0.12,
        ease: 'power3.out',
      });

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

      const mapFrame = root.querySelector('.map-frame');
      if (mapFrame) {
        const paths = gsap.utils.toArray<SVGPathElement>('.map-route, .map-route-head, .map-route-flow');
        paths.forEach((path) => {
          const len = path.getTotalLength?.() ?? 900;
          gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
        });

        gsap.to(paths, {
          strokeDashoffset: 0,
          duration: 1.45,
          stagger: 0.07,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: mapFrame,
            start: 'top 82%',
            once: true,
          },
          onComplete: () => {
            gsap.set('.map-route-flow', { clearProps: 'strokeDasharray,strokeDashoffset' });
            this.startTour();
          },
        });

        gsap.to('.map-orbit', {
          rotation: 360,
          transformOrigin: '50% 50%',
          svgOrigin: '500 220',
          duration: 80,
          repeat: -1,
          ease: 'none',
        });

        gsap.to('.map-orbit-inner', {
          rotation: -360,
          transformOrigin: '50% 50%',
          svgOrigin: '500 220',
          duration: 55,
          repeat: -1,
          ease: 'none',
        });
      }
    }, root);

    requestAnimationFrame(() => ScrollTrigger.refresh());
  }
}
