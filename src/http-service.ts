import { Observable } from 'rxjs';

import { HttpRequestOptions } from './http-request-options';

/**
 * An interceptor is a function that takes the prepared HTTP request data and returns them modified.
 */
export type HttpRequestInterceptor = (request: HttpRequestOptions) => HttpRequestOptions;

/**
 * Generic interface of an HTTP service capable of sending a request and return the response as an RxJs Observable.
 * In case of a successful HTTP request the observable has to contain the response body.
 * In case of an error the observable has to throw an HttpErrorResponse.
 * @see HttpErrorResponse
 */
export interface HttpService {
  /**
   * Performs an HTTP Request.
   * @param options request data
   */
  request(options: HttpRequestOptions): Observable<any>;

  setRequestInterceptor(interceptor?: HttpRequestInterceptor): void;
}
