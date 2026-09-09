import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  SimpleChanges,
  forwardRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface SelectOption {
  value: string;
  label: string;
  hint?: string;
  icon?: string;
}

@Component({
  selector: 'app-select-menu',
  templateUrl: './select-menu.component.html',
  styleUrls: ['./select-menu.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectMenuComponent),
      multi: true,
    },
  ],
})
export class SelectMenuComponent implements ControlValueAccessor, OnChanges {
  @Input() options: SelectOption[] = [];
  @Input() placeholder = '';
  @Input() tone: 'light' | 'dark' = 'light';
  @Input() labelledBy = '';

  value = '';
  label = '';
  hint = '';
  icon = '';
  open = false;
  disabled = false;
  active = -1;

  private onChange: (v: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  constructor(
    private host: ElementRef<HTMLElement>,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options']) {
      this.syncFromValue();
    }
  }

  writeValue(value: string | null): void {
    this.value = value ?? '';
    this.syncFromValue();
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }

  indexOf(i: number): string {
    return String(i + 1).padStart(2, '0');
  }

  trackOpt(_i: number, opt: SelectOption): string {
    return opt.value;
  }

  toggle(): void {
    if (this.disabled) {
      return;
    }
    this.open = !this.open;
    if (this.open) {
      this.active = Math.max(
        0,
        this.options.findIndex((o) => o.value === this.value)
      );
    }
    this.cdr.markForCheck();
  }

  pick(opt: SelectOption): void {
    if (this.disabled || !opt) {
      return;
    }
    this.value = opt.value;
    this.label = opt.label;
    this.hint = opt.hint || '';
    this.icon = opt.icon || '';
    this.open = false;
    this.onChange(opt.value);
    this.onTouched();
    this.cdr.markForCheck();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(ev: MouseEvent): void {
    if (!this.open) {
      return;
    }
    const target = ev.target as Node | null;
    if (target && this.host.nativeElement.contains(target)) {
      return;
    }
    this.open = false;
    this.onTouched();
    this.cdr.markForCheck();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (!this.open) {
      return;
    }
    this.open = false;
    this.cdr.markForCheck();
  }

  private syncFromValue(): void {
    const found = this.options.find((o) => o.value === this.value);
    this.label = found?.label || '';
    this.hint = found?.hint || '';
    this.icon = found?.icon || '';
  }
}
