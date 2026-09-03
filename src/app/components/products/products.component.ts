import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../services/language.service';
import { Lang, L, productCategories, products } from '../../data/content';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
})
export class ProductsComponent implements OnDestroy {
  categories = productCategories;
  products = products;
  active = 'all';
  lang: Lang = this.language.current;
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

  get filtered() {
    return this.active === 'all' ? this.products : this.products.filter((p) => p.category === this.active);
  }

  setFilter(id: string): void {
    this.active = id;
  }
}
