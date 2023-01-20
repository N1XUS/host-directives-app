import { Observable } from "rxjs";

export type ProviderParams = ReadonlyMap<string, unknown>;

export abstract class AbstractDataProvider<T> {
  /**
   * Method responsible for retrieving the data.
   * @param params Set of parameters used for search query.
   * @param start Start index of the items array.
   * @param end End index of the items array.
   */
  abstract fetch(params?: ProviderParams, start?: number, end?: number): Observable<T[]>
}
