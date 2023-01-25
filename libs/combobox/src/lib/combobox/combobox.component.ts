import {
  Component,
  ElementRef,
  HostBinding,
  inject,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CvaDirective } from '@host-directives-app/cva';
import {
  DataSourceDirective,
  DATA_SOURCE_TRANSFORMER,
} from '@host-directives-app/data-source';
import { DestroyedService, Nullable } from '@host-directives-app/shared';
import { filter, takeUntil } from 'rxjs';
import {
  AcceptableComboboxItem,
  ComboboxDataSource,
  ComboboxDataTransformer,
  ComboboxItem,
} from './data-transformer.class';

let UNIQUE_ID = 0;

@Component({
  selector: 'app-combobox',
  templateUrl: './combobox.component.html',
  styleUrls: ['./combobox.component.scss'],
  providers: [
    DestroyedService,
    {
      provide: DATA_SOURCE_TRANSFORMER,
      useClass: ComboboxDataTransformer,
    },
  ],
  hostDirectives: [
    {
      directive: CvaDirective,
    },
    {
      directive: DataSourceDirective,
      // Expose dataSource input property directly on combobox component
      // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property, @angular-eslint/no-input-rename
      inputs: ['dataSource:options'],
      // Expose data source's directive outputs directly from combobox component.
      // eslint-disable-next-line @angular-eslint/no-outputs-metadata-property
      outputs: ['dataSourceChanged', 'dataChanged'],
    },
  ],
})
export class ComboboxComponent implements OnInit {
  readonly _cvaDirective =
    inject<CvaDirective<AcceptableComboboxItem>>(CvaDirective);
  readonly _dataSourceDirective =
    inject<DataSourceDirective<AcceptableComboboxItem, ComboboxDataSource>>(
      DataSourceDirective
    );
  private readonly _destroyed$ = inject(DestroyedService);
  @ViewChild('comboboxInput')
  comboboxInput?: ElementRef<HTMLInputElement>;
  readonly uniqueId = ++UNIQUE_ID;

  @HostBinding('class.is-invalid')
  controlInvalid = false;

  get value(): Nullable<AcceptableComboboxItem> {
    return this._cvaDirective.value;
  }

  @Input()
  placeholder: Nullable<string> = null;

  // @Input()
  options: ComboboxItem[] = [];

  ngOnInit(): void {
    this._dataSourceDirective.dataChanged$
      .pipe(takeUntil(this._destroyed$))
      .subscribe((data) => {
        this.options = this._formatOptions(data);
        console.log(data);
      });
    this._cvaDirective.stateChanges
      .pipe(
        filter((stateType) => stateType === 'updateErrorState'),
        takeUntil(this._destroyed$)
      )
      .subscribe(() => {
        this.controlInvalid = this._cvaDirective.controlInvalid;
      });
  }

  /** Method called when user types into the input field. */
  onInput(event: Event) {
    this._cvaDirective.setValue(
      (<HTMLInputElement>event.target).value ?? '',
      true
    );
  }

  /** Method called when user focuses-out the input field. */
  onBlur() {
    this._cvaDirective.onTouched();
  }

  private _formatOptions(data: AcceptableComboboxItem[]): ComboboxItem[] {
    return data.map((option) =>
      typeof option === 'string' ? { value: option, label: option } : option
    );
  }
}
