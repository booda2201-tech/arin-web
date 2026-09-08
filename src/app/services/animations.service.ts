import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import AOS from 'aos';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Observer } from 'gsap/Observer';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';

gsap.registerPlugin(ScrollTrigger, Observer, DrawSVGPlugin, MorphSVGPlugin);

@Injectable({ providedIn: 'root' })
export class AnimationsService implements OnDestroy {
  private aosReady = false;
  private chrome?: ReturnType<typeof gsap.context>;
  private magnetOff: Array<() => void> = [];
  private moveHandler?: (e: PointerEvent) => void;
  private lastUrl?: string;
  private refreshQueued = false;

  constructor(
    private readonly router: Router,
    private readonly zone: NgZone
  ) {
    this.router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd)).subscribe((e) => {
      const url = e.urlAfterRedirects;
      const isReload = this.lastUrl === undefined && this.isReload();
      if (!isReload) {
        window.scrollTo({ top: 0 });
      }
      this.lastUrl = url;
      this.zone.runOutsideAngular(() => {
        this.scheduleRefresh();
      });
    });
  }

  initAos(): void {
    this.zone.runOutsideAngular(() => {
      if (!this.aosReady) {
        AOS.init({
          duration: 750,
          easing: 'ease-out-cubic',
          once: true,
          offset: 72,
        });
        this.aosReady = true;
        this.initChrome();
      } else {
        this.refreshAos();
      }
    });
  }

  refreshAos(): void {
    this.zone.runOutsideAngular(() => AOS.refresh());
  }

  ngOnDestroy(): void {
    this.teardownChrome();
  }

  private initChrome(): void {
    this.teardownChrome();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = window.matchMedia('(pointer: fine)').matches;

    this.chrome = gsap.context(() => {
      gsap.set('.scroll-progress', { scaleX: 0, transformOrigin: document.documentElement.dir === 'rtl' ? '100% 50%' : '0% 50%' });
      gsap.to('.scroll-progress', {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: { start: 0, end: 'max', scrub: 0.25, refreshPriority: -20 },
      });

      gsap.to('.site-geo-compass', {
        rotation: 220,
        ease: 'none',
        scrollTrigger: { start: 0, end: 'max', scrub: 0.6, refreshPriority: -20 },
      });
      gsap.to('.site-geo-shard.a', {
        y: 160,
        rotation: 40,
        ease: 'none',
        scrollTrigger: { start: 0, end: 'max', scrub: 0.8, refreshPriority: -20 },
      });
      gsap.to('.site-geo-shard.b', {
        y: -180,
        rotation: -55,
        ease: 'none',
        scrollTrigger: { start: 0, end: 'max', scrub: 0.8, refreshPriority: -20 },
      });

      if (reduce) {
        return;
      }
    });

    this.bindMagnets();
  }

  private scheduleRefresh(): void {
    if (this.refreshQueued) {
      return;
    }
    this.refreshQueued = true;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.refreshQueued = false;
        this.refreshAos();
        this.bindMagnets();
        ScrollTrigger.refresh();
      });
    });
  }

  private bindMagnets(): void {
    this.magnetOff.forEach((off) => off());
    this.magnetOff = [];
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    if (!window.matchMedia('(pointer: fine)').matches) {
      return;
    }

    document.querySelectorAll<HTMLElement>('.btn').forEach((btn) => {
      const move = (e: PointerEvent) => {
        const r = btn.getBoundingClientRect();
        gsap.to(btn, {
          x: (e.clientX - r.left - r.width / 2) * 0.32,
          y: (e.clientY - r.top - r.height / 2) * 0.32,
          duration: 0.35,
          ease: 'power3.out',
          overwrite: 'auto',
        });
      };
      const leave = () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.45)', overwrite: 'auto' });
        document.documentElement.classList.remove('cursor-grow');
      };
      const enter = () => document.documentElement.classList.add('cursor-grow');
      btn.addEventListener('pointermove', move);
      btn.addEventListener('pointerleave', leave);
      btn.addEventListener('pointerenter', enter);
      this.magnetOff.push(() => {
        btn.removeEventListener('pointermove', move);
        btn.removeEventListener('pointerleave', leave);
        btn.removeEventListener('pointerenter', enter);
        gsap.set(btn, { x: 0, y: 0 });
      });
    });
  }

  private teardownChrome(): void {
    this.magnetOff.forEach((off) => off());
    this.magnetOff = [];
    if (this.moveHandler) {
      window.removeEventListener('pointermove', this.moveHandler);
      this.moveHandler = undefined;
    }
    document.documentElement.classList.remove('has-cursor', 'cursor-grow');
    this.chrome?.revert();
    this.chrome = undefined;
  }

  private isReload(): boolean {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    return nav?.type === 'reload';
  }
}
