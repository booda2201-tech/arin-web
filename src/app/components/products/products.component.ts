import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../services/language.service';
import { AdminDataService } from '../../services/admin-data.service';
import { Lang, L, ProductCategory, ProductItem } from '../../data/content';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
})
export class ProductsComponent implements OnDestroy {
  categories: ProductCategory[] = [];
  products: ProductItem[] = [];
  active = 'all';
  lang: Lang = this.language.current;
  private sub = new Subscription();

  constructor(
    public language: LanguageService,
    private adminData: AdminDataService
  ) {
    this.sub.add(
      this.language.languageChanged$.subscribe((lang) => (this.lang = lang))
    );
    this.sub.add(
      this.adminData.products$.subscribe((items) => (this.products = items))
    );
    this.sub.add(
      this.adminData.categories$.subscribe(() => {
        this.categories = this.adminData.getFilterCategories();
        if (this.active !== 'all' && !this.adminData.getCategories().some((c) => c.id === this.active)) {
          this.active = 'all';
        }
      })
    );
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
