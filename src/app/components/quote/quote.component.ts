import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../services/language.service';
import { Lang, products, services } from '../../data/content';

@Component({
  selector: 'app-quote',
  templateUrl: './quote.component.html',
  styleUrls: ['./quote.component.scss'],
})
export class QuoteComponent implements OnDestroy {
  services = services;
  products = products;
  lang: Lang = this.language.current;
  step = 0;
  status: 'idle' | 'done' = 'idle';
  reference = '';
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

  constructor(
    public language: LanguageService,
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

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  next(): void {
    if (this.step === 0 && (!this.form.value.quantity || !this.form.value.destination)) {
      this.form.controls.quantity.markAsTouched();
      this.form.controls.destination.markAsTouched();
      return;
    }
    if (this.step === 2) {
      this.form.controls.name.markAsTouched();
      this.form.controls.email.markAsTouched();
      this.form.controls.phone.markAsTouched();
      if (this.form.controls.name.invalid || this.form.controls.email.invalid || this.form.controls.phone.invalid) {
        return;
      }
    }
    if (this.step < 3) {
      this.step += 1;
    }
  }

  back(): void {
    if (this.step > 0) {
      this.step -= 1;
    }
  }

  submit(): void {
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
}
