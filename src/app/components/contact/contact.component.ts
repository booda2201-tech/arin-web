import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../services/language.service';
import { Lang, mailHref, services, site, telHref, whatsappHref } from '../../data/content';
import { SelectOption } from '../select-menu/select-menu.component';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
})
export class ContactComponent implements OnDestroy {
  site = site;
  services = services;
  lang: Lang = this.language.current;
  attempted = false;
  sent = false;
  tel = telHref();
  mail = mailHref();
  wa = whatsappHref();
  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    company: [''],
    phone: ['', Validators.required],
    interest: [''],
    message: ['', [Validators.required, Validators.minLength(10)]],
  });
  private sub: Subscription;

  constructor(
    public language: LanguageService,
    private fb: FormBuilder
  ) {
    this.sub = this.language.languageChanged$.subscribe((lang) => (this.lang = lang));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  get interestOptions(): SelectOption[] {
    return this.services.map((s) => ({
      value: s.slug,
      label: s.title[this.lang],
      hint: s.subtitle[this.lang],
      icon: s.icon,
    }));
  }

  bad(name: string): boolean {
    const control = this.form.get(name);
    return !!control && control.invalid && (control.touched || this.attempted);
  }

  send(): void {
    this.attempted = true;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.sent = true;
  }
}
