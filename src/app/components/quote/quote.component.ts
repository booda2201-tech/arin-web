import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import gsap from 'gsap';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../services/language.service';
import { AdminDataService } from '../../services/admin-data.service';
import { Lang, products, services, site, telHref, whatsappHref } from '../../data/content';
import { SelectOption } from '../select-menu/select-menu.component';

@Component({
  selector: 'app-quote',
  templateUrl: './quote.component.html',
  styleUrls: ['./quote.component.scss'],
})
export class QuoteComponent implements AfterViewInit, OnDestroy {
  @ViewChild('pane') pane?: ElementRef<HTMLElement>;

  services = services;
  products = products;
  site = site;
  lang: Lang = this.language.current;
  step = 0;
  blocked = false;
  status: 'idle' | 'done' = 'idle';
  reference = '';
  tel = telHref();
  wa = whatsappHref();
  stepKeys = ['S1', 'S2', 'S3', 'S4'];
  modes = [
    { value: 'sea', label: 'SEA', hint: 'SEA_HINT', icon: 'bi-ship' },
    { value: 'land', label: 'LAND', hint: 'LAND_HINT', icon: 'bi-truck' },
    { value: 'unsure', label: 'UNSURE', hint: 'UNSURE_HINT', icon: 'bi-compass' },
  ];
  form = this.fb.group({
    service: [''],
    product: [''],
    quantity: ['', Validators.required],
    destination: ['', Validators.required],
    mode: ['sea'],
    name: ['', Validators.required],
    company: [''],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    notes: [''],
  });
  private sub: Subscription;
  private ctx?: ReturnType<typeof gsap.context>;

  constructor(
    public language: LanguageService,
    private adminData: AdminDataService,
    private fb: FormBuilder,
    route: ActivatedRoute
  ) {
    this.sub = this.language.languageChanged$.subscribe((lang) => (this.lang = lang));
    const q = route.snapshot.queryParamMap;
    this.form.patchValue({
      service: q.get('service') || '',
      product: q.get('product') || '',
    });
  }

  get serviceOptions(): SelectOption[] {
    return this.services.map((s) => ({
      value: s.slug,
      label: s.title[this.lang],
      hint: s.subtitle[this.lang],
      icon: s.icon,
    }));
  }

  get productOptions(): SelectOption[] {
    return this.products.map((p) => ({
      value: p.slug,
      label: p.name[this.lang],
      hint: p.origin[this.lang],
      icon: 'bi-box-seam',
    }));
  }

  get modeKey(): string {
    const mode = this.form.value.mode;
    if (mode === 'land') {
      return 'LAND';
    }
    if (mode === 'unsure') {
      return 'UNSURE';
    }
    return 'SEA';
  }

  ngAfterViewInit(): void {
    this.playPane();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.ctx?.revert();
  }

  bad(name: string): boolean {
    const control = this.form.get(name);
    return !!control && control.invalid && (control.touched || this.blocked);
  }

  next(): void {
    if (this.step === 0 && (!this.form.value.quantity || !this.form.value.destination)) {
      this.form.controls.quantity.markAsTouched();
      this.form.controls.destination.markAsTouched();
      this.blocked = true;
      return;
    }
    if (this.step === 2) {
      this.form.controls.name.markAsTouched();
      this.form.controls.email.markAsTouched();
      this.form.controls.phone.markAsTouched();
      if (this.form.controls.name.invalid || this.form.controls.email.invalid || this.form.controls.phone.invalid) {
        this.blocked = true;
        return;
      }
    }
    this.blocked = false;
    if (this.step < 3) {
      this.step += 1;
      this.playSoon();
    }
  }

  back(): void {
    this.blocked = false;
    if (this.step > 0) {
      this.step -= 1;
      this.playSoon();
    }
  }

  submit(): void {
    const val = this.form.value;
    this.adminData.addSubmission({
      type: 'quote',
      name: val.name || '',
      company: val.company || '',
      email: val.email || '',
      phone: val.phone || '',
      status: 'new',
      details: {
        service: this.serviceLabel(),
        product: this.productLabel(),
        quantity: val.quantity || '',
        destination: val.destination || '',
        mode: this.modeKey,
        notes: val.notes || '',
      },
    });
    this.reference = 'ARIN-' + Math.floor(1000 + Math.random() * 9000);
    this.status = 'done';
  }

  serviceLabel(): string {
    const found = this.services.find((s) => s.slug === this.form.value.service);
    return found ? found.title[this.lang] : '—';
  }

  productLabel(): string {
    const found = this.products.find((p) => p.slug === this.form.value.product);
    return found ? found.name[this.lang] : '—';
  }

  private playSoon(): void {
    setTimeout(() => this.playPane(), 20);
  }

  private playPane(): void {
    this.ctx?.revert();
    const root = this.pane?.nativeElement;
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    this.ctx = gsap.context(() => {
      gsap.fromTo(
        '.quote-in',
        { autoAlpha: 0 },
        {
          autoAlpha: 1,
          duration: 0.4,
          stagger: 0.05,
          ease: 'power3.out',
          clearProps: 'opacity,visibility',
        }
      );
    }, root);
  }
}
