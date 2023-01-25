import { Directive, EventEmitter, inject, InjectionToken, Input, OnDestroy, Output } from '@angular/core';
import { DestroyedService, Nullable } from '@host-directives-app/shared';
import { BehaviorSubject, Subscription, takeUntil } from 'rxjs';
import {
  AbstractDataSourceProvider,
  DataSource,
  DataSourceParser,
  isDataSource,
} from './abstract-data-source-provider.class';

export const DATA_SOURCE_TRANSFORMER = new InjectionToken<DataSourceParser>('DataSourceTransformerClass');

@Directive({
  selector: '[appDataSource]',
  standalone: true,
  providers: [DestroyedService],
})
export class DataSourceDirective<
  T = unknown,
  P extends AbstractDataSourceProvider<T> = AbstractDataSourceProvider<T>
> implements OnDestroy {
  @Input()
  set dataSource(data: Nullable<DataSource<T>>) {
    this._dataSource = data;

    this.dataSourceChanged.next();

    this._initializeDataSource();
  }

  get dataSource() {
    return this._dataSource;
  }

  /** @hidden */
  dataSourceProvider: Nullable<P>;

  /** @hidden */
  private _dsSubscription = new Subscription();

  /**
   * Data stream. Emits when new data retrieved.
   */
  readonly dataChanged$ = new BehaviorSubject<T[]>([]);

  /**
   * Emits when the data source object has been changed.
   */
  @Output()
  readonly dataSourceChanged = new EventEmitter<void>();

  /**
   * Event emitted when datasource content has been changed.
   */
  @Output()
  readonly dataChanged = new EventEmitter<T[]>();

  private _dataSource: Nullable<DataSource<T>>;

  private readonly _destroyed$ = inject(DestroyedService);

  private readonly _dataSourceTransformer = inject<DataSourceParser<T, P>>(DATA_SOURCE_TRANSFORMER);

  /** @hidden */
  private _initializeDataSource(): void {
    if (isDataSource(this.dataSource)) {
      this._dsSubscription?.unsubscribe();
    }
    // Convert whatever comes in as DataSource, so we can work with it identically
    this.dataSourceProvider = this._toDataStream(this.dataSource);

    if (!this.dataSourceProvider) {
      return;
    }

    this._dsSubscription = new Subscription();

    this._dsSubscription.add(
      this.dataSourceProvider.fetch()
        .pipe(takeUntil(this._destroyed$))
        .subscribe((data) => {
          this.dataChanged.emit(data);
          this.dataChanged$.next(data);
        })
    );
  }

  /** @hidden */
  ngOnDestroy(): void {
    this._dsSubscription?.unsubscribe();
  }

  /** @Hidden */
  private _toDataStream(source: Nullable<DataSource<T>>): Nullable<P> {
    return this._dataSourceTransformer
      ? this._dataSourceTransformer.parse(source)
      : undefined;
  }
}
