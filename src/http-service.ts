import { Observable } from 'rxjs';

import { NamedValues } from './named-values';

/** HTTP Method to be used in the request. */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD';

/**
 * HTTP Request options.
 *  - url: required request URL
 *  - method: required request method (e.g. GET)
 *  - body: optional content to be sent as the request body
 *  - headers: optional HTTP headers to be added to the request
 *  - params: optional query parameters to be sent along with the request
 */
export interface HttpRequestOptions {
  url: string;
  method: HttpMethod;
  body?: any;
  headers?: NamedValues;
  params?: NamedValues;
}

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
}