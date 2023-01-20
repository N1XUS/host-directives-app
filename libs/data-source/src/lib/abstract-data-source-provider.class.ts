import { Nullable } from '@host-directives-app/shared';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
import { AbstractDataProvider } from './abstract-data-provider.class';

/**
 * Acceptable data source types.
 */
export type DataSource<T = unknown> =
  | AbstractDataSourceProvider<T>
  | Observable<T[]>
  | T[];

export interface DataSourceParser<
  T = unknown,
  P extends AbstractDataSourceProvider<T> = AbstractDataSourceProvider<T>
> {
  /**
   * Defines which data provider class to initiate.
   * @param source data source to be parsed.
   */
  parse(source: Nullable<DataSource<T>>): Nullable<P>;
}

export function isDataSource<T = unknown>(
  value: any
): value is AbstractDataSourceProvider<T> {
  return (
    value &&
    'unsubscribe' &&
    typeof value.unsubscribe === 'function' &&
    value.dataChanges
  );
}

export class AbstractDataSourceProvider<T = unknown> {
  /** @hidden */
  protected readonly _dataChanges$: BehaviorSubject<T[]> = new BehaviorSubject<
    T[]
  >([]);
  /** @hidden */
  protected readonly _dataRequested$ = new Subject<void>();
  /** @hidden */
  protected readonly _dataReceived$ = new Subject<void>();
  /** @hidden */
  protected readonly _destroy$ = new Subject<void>();

  /** @hidden */
  protected readonly _dataLoading$ = new BehaviorSubject<boolean>(false);

  /**
   * Emitted when new data has been requested.
   * @returns Observable
   */
  get dataRequested(): Observable<void> {
    return this._dataRequested$.asObservable();
  }

  /**
   * Emitted when new data has been received.
   * @returns Observable
   */
  get dataReceived(): Observable<void> {
    return this._dataReceived$.asObservable();
  }

  /**
   * Emitted when loading state has been changed.
   * @returns Observable.
   */
  get dataLoading(): Observable<boolean> {
    return this._dataLoading$.asObservable();
  }

  /**
   * Emits when data from the provides has been changed.
   * @returns Observable of data source objects.
   */
  get dataChanges(): Observable<T[]> {
    return this._dataChanges$.asObservable().pipe(takeUntil(this._destroy$));
  }

  /** @hidden */
  protected constructor(public dataProvider: AbstractDataProvider<T>) {}

  match(): void {
    this._dataRequested$.next();
    this._dataLoading$.next(true);

    this.dataProvider
      .fetch()
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (result: T[]) => {
          this._dataReceived$.next();
          this._dataLoading$.next(false);
          this._dataChanges$.next(result);
        },
        error: () => {
          this._dataReceived$.next();
          this._dataLoading$.next(false);
        },
      });
  }

  /**
   * Closes the stream
   */
  unsubscribe(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
