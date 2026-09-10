import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';
import { images, site } from '../../data/content';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  site = site;
  images = images;
  loading = false;
  errorMessage = '';
  showPassword = false;
  returnUrl = '';
  lang = this.language.current;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    remember: [true],
  });

  private sub: Subscription;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    public language: LanguageService
  ) {
    this.sub = this.language.languageChanged$.subscribe((l) => (this.lang = l));
  }

  ngOnInit(): void {
    // If already logged in, redirect
    if (this.auth.isLoggedIn) {
      if (this.auth.isAdmin) {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/']);
      }
      return;
    }

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '';
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const { email, password } = this.form.value;

    this.auth.login(email || '', password || '').subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success && res.user) {
          if (this.returnUrl) {
            this.router.navigateByUrl(this.returnUrl);
          } else if (res.user.role === 'admin') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/']);
          }
        } else {
          this.errorMessage = res.message || 'بيانات الدخول غير صحيحة';
        }
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'حدث خطأ غير متوقع، يرجى المحاولة لاحقاً';
      },
    });
  }
}
