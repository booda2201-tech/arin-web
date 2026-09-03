import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../services/language.service';
import {
  Lang,
  L,
  ProductItem,
  categoryName,
  getProduct,
  relatedProducts,
} from '../../data/content';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'],
})
export class ProductDetailComponent implements OnDestroy {
  product?: ProductItem;
  related: ProductItem[] = [];
  lang: Lang = this.language.current;
  private sub = new Subscription();

  constructor(
    public language: LanguageService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.sub.add(this.language.languageChanged$.subscribe((lang) => (this.lang = lang)));
    this.sub.add(
      this.route.paramMap.subscribe((params) => {
        this.load(params.get('slug') || '');
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  txt(copy: L): string {
    return copy[this.lang];
  }

  categoryLabel(): string {
    return this.product ? categoryName(this.product.category, this.lang) : '';
  }

  availabilityKey(): string {
    return this.product?.availability === 'in-supply' ? 'PRODUCTS_PAGE.IN_SUPPLY' : 'PRODUCTS_PAGE.ON_DEMAND';
  }

  specRows(): { label: L; value: string }[] {
    if (!this.product) {
      return [];
    }
    return [
      { label: { ar: 'المنشأ', en: 'Origin' }, value: this.txt(this.product.origin) },
      { label: { ar: 'التعبئة', en: 'Packaging' }, value: this.txt(this.product.packaging) },
      { label: { ar: 'أقل كمية للطلب', en: 'Minimum order' }, value: this.txt(this.product.moq) },
      ...this.product.specs.map((s) => ({ label: s.label, value: this.txt(s.value) })),
    ];
  }

  private load(slug: string): void {
    this.product = getProduct(slug);
    this.related = slug ? relatedProducts(slug) : [];
    if (!this.product && slug) {
      this.router.navigateByUrl('/products');
    }
  }
}
