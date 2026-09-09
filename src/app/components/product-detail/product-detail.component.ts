import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../services/language.service';
import { AdminDataService } from '../../services/admin-data.service';
import {
  Lang,
  L,
  ProductItem,
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
  activeImageIndex = 0;
  private sub = new Subscription();

  constructor(
    public language: LanguageService,
    private adminData: AdminDataService,
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
    return this.product ? this.adminData.categoryLabel(this.product.category, this.lang) : '';
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

  get allImages(): string[] {
    if (!this.product) {
      return [];
    }
    if (this.product.images && this.product.images.length > 0) {
      return this.product.images;
    }
    return this.product.image ? [this.product.image] : [];
  }

  get currentImage(): string {
    const list = this.allImages;
    return list[this.activeImageIndex] || this.product?.image || '';
  }

  setActiveImage(index: number): void {
    this.activeImageIndex = index;
  }

  nextImage(): void {
    const total = this.allImages.length;
    if (total <= 1) return;
    this.activeImageIndex = (this.activeImageIndex + 1) % total;
  }

  prevImage(): void {
    const total = this.allImages.length;
    if (total <= 1) return;
    this.activeImageIndex = (this.activeImageIndex - 1 + total) % total;
  }

  private load(slug: string): void {
    this.activeImageIndex = 0;
    const fromAdmin = this.adminData.getProducts().find((p) => p.slug === slug);
    this.product = fromAdmin || getProduct(slug);
    this.related = slug ? relatedProducts(slug) : [];
    if (!this.product && slug) {
      this.router.navigateByUrl('/products');
    }
  }
}
