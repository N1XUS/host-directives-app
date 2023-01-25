import { Nullable } from '@host-directives-app/shared';
import { Observable } from 'rxjs';

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

export abstract class AbstractDataSourceProvider<T = unknown> {
  abstract fetch(): Observable<T[]>;
}
