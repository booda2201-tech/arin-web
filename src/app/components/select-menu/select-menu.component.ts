import {
  Component,
  ElementRef,
  HostBinding,
  HostListener,
  Input,
  ViewChild,
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
export class SelectMenuComponent implements ControlValueAccessor {
  @Input() options: SelectOption[] = [];
  @Input() placeholder = '';
  @Input() tone: 'light' | 'dark' = 'light';
  @Input() labelledBy = '';

  @ViewChild('trigger') trigger?: ElementRef<HTMLElement>;
  @ViewChild('panel') panel?: ElementRef<HTMLElement>;

  @HostBinding('class.is-open') get opened(): boolean {
    return this.open;
  }

  value = '';
  open = false;
  disabled = false;
  active = -1;
  box = { top: 0, left: 0, width: 0 };

  private onChange: (v: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  constructor(private host: ElementRef<HTMLElement>) {}

  get selected(): SelectOption | undefined {
    return this.options.find((o) => o.value === this.value);
  }

  writeValue(value: string | null): void {
    this.value = value || '';
  }

  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  indexOf(i: number): string {
    return String(i + 1).padStart(2, '0');
  }

  toggle(ev: Event): void {
    ev.stopPropagation();
    if (this.disabled) {
      return;
    }
    this.open ? this.close() : this.show();
  }

  choose(opt: SelectOption, ev?: Event): void {
    ev?.stopPropagation();
    this.value = opt.value;
    this.onChange(opt.value);
    this.onTouched();
    this.close();
  }

  @HostListener('document:pointerdown', ['$event'])
  onDoc(ev: Event): void {
    if (!this.open) {
      return;
    }
    const t = ev.target as Node;
    if (this.host.nativeElement.contains(t) || this.panel?.nativeElement.contains(t)) {
      return;
    }
    this.close();
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onWin(): void {
    if (this.open) {
      this.place();
    }
  }

  @HostListener('keydown', ['$event'])
  onKey(ev: KeyboardEvent): void {
    if (this.disabled) {
      return;
    }
    if (!this.open) {
      if (ev.key === 'ArrowDown') {
        ev.preventDefault();
        this.show();
      }
      return;
    }
    if (ev.key === 'Escape') {
      ev.preventDefault();
      this.close();
      return;
    }
    if (ev.key === 'ArrowDown') {
      ev.preventDefault();
      this.move(1);
      return;
    }
    if (ev.key === 'ArrowUp') {
      ev.preventDefault();
      this.move(-1);
      return;
    }
    if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      const opt = this.options[this.active];
      if (opt) {
        this.choose(opt);
      }
    }
  }

  close(): void {
    if (!this.open) {
      return;
    }
    this.open = false;
    this.onTouched();
  }

  private show(): void {
    this.open = true;
    this.active = Math.max(
      0,
      this.options.findIndex((o) => o.value === this.value)
    );
    this.place();
  }

  private place(): void {
    const trigger = this.trigger?.nativeElement;
    if (!trigger) {
      return;
    }
    const r = trigger.getBoundingClientRect();
    const gap = 8;
    const maxH = Math.min(512, window.innerHeight * 0.7);
    const below = window.innerHeight - r.bottom - gap;
    const openUp = below < 180 && r.top > below;
    this.box = {
      top: openUp ? Math.max(12, r.top - gap - maxH) : r.bottom + gap,
      left: r.left,
      width: r.width,
    };
  }

  private move(dir: number): void {
    if (!this.options.length) {
      return;
    }
    this.active = (this.active + dir + this.options.length) % this.options.length;
    const row = this.panel?.nativeElement.children[this.active] as HTMLElement | undefined;
    row?.scrollIntoView({ block: 'nearest' });
  }
}
