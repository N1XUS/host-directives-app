import {
  AfterViewInit,
  ChangeDetectorRef,
  Directive,
  DoCheck,
  ElementRef,
  inject,
  Input,
  OnDestroy,
} from '@angular/core';
import {
  ControlContainer,
  ControlValueAccessor,
  FormControl,
  FormGroupDirective,
  NgControl,
  NgForm,
} from '@angular/forms';
import { DestroyedService, Nullable } from '@host-directives-app/shared';
import { Subject, Subscription } from 'rxjs';

@Directive({
  selector: '[appCva]',
  standalone: true,
  providers: [DestroyedService],
})
export class CvaDirective<T = unknown> implements ControlValueAccessor, OnDestroy, AfterViewInit, DoCheck {
  /**
   * NgControl instance.
   */
  readonly ngControl = inject(NgControl, {
    optional: true,
  });

  readonly cdRef = inject(ChangeDetectorRef, {
    host: true
  })

  /**
   * Form container instance. Usually ngForm or FormGroup directives.
   */
  readonly controlContainer = inject(ControlContainer, {
    optional: true,
    skipSelf: true,
  });

  /**
   * Separate NgForm instance. For cases when formGroup is used with the form itself.
   */
  readonly ngForm = inject(NgForm, {
    optional: true,
    skipSelf: true,
  });

  /**
   * Element reference.
   */
  readonly elementRef = inject(ElementRef);

  private readonly _destroy$ = inject(DestroyedService);

  /** Whether the input is disabled */
  @Input()
  set disabled(value: boolean) {
    this.setDisabledState(value);
  }
  get disabled(): boolean {
    if (this.ngControl && this.ngControl.disabled !== null) {
      return this.ngControl.disabled;
    }
    return this._disabled;
  }

  private _disabled = false;

  /**
   * Current value of the control.
   */
  value: Nullable<T>;

  /** Whether control has errors */
  get controlInvalid(): boolean {
    return this._controlInvalid;
  }

  /**
   * @hidden
   */
  private _controlInvalid = false;

  /**
   * Emits ehen state of the control has been changed.
   */
  readonly stateChanges: Subject<string> = new Subject<string>();

  /** @hidden */
  private readonly _subscriptions = new Subscription();

  /** @hidden */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onChange: (value: unknown) => void = () => {};

  /** @hidden */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onTouched = (): void => {};

  /** @hidden */
  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  /**
   * Re-validate and emit event to parent container on every CD cycle as they are some errors
   * that we can't subscribe to.
   */
  ngDoCheck(): void {
    if (this.ngControl) {
      this.updateErrorState();
    }
  }

  /** @hidden */
  ngAfterViewInit(): void {
    if (this.ngControl) {
      this._subscriptions.add(
        this.ngControl.statusChanges?.subscribe(() => {
          this._markForCheck();
        })
      );
    }
  }

  /** @hidden */
  ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
    this.stateChanges.complete();
    // this.formField?.unregisterFormFieldControl(this);
  }

  writeValue(value: T): void {
    this.value = value;
    this.stateChanges.next('writeValue');
    this._markForCheck();
  }
  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    if (isDisabled === this._disabled) {
      return;
    }
    this._disabled = isDisabled;
    this.stateChanges.next('setDisabledState');
    this._markForCheck();
  }

  /**
   *  Need re-validates errors on every CD iteration to make sure we are also
   *  covering non-control errors, errors that happens outside of this control
   */
  updateErrorState(): void {
    const parent = this.ngForm;
    const parentControlContainer = this.controlContainer;
    const control = this.ngControl
      ? (this.ngControl.control as FormControl)
      : null;
    const newStatusIsError = !!(
      control?.invalid &&
      (control.dirty ||
        control.touched ||
        parent?.submitted ||
        (parentControlContainer as unknown as FormGroupDirective)?.submitted)
    );

    if (newStatusIsError !== this.controlInvalid) {
      this._controlInvalid = newStatusIsError;
      this.stateChanges.next('updateErrorState');
      this._markForCheck();
    }
  }

  /**
   * Used to change the value of a control.
   * @param value the value to be applied
   * @param emitOnChange whether to emit "onChange" event.
   * Should be "false", if the change is made programmatically (internally) by the control, "true" otherwise
   */
  setValue(value: T, emitOnChange = true): void {
    if (value !== this.value) {
      this.writeValue(value);
      if (emitOnChange) {
        this.onChange(value);
      }
      this._markForCheck();
    }
  }

  /** @hidden */
  private _markForCheck(): void {
    // We cannot use direct changeDetectorRef since it's scope is outside component's.
    this.cdRef.markForCheck();
  }
}
