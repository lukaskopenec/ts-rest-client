import { Observable, of, throwError } from 'rxjs';

import { HttpService, HttpRequestOptions } from './http-service';
import { HttpErrorResponse } from './http-error-response';
import { StringMap } from './named-values';

interface HttpResponseOptions {
  status: number;
  statusText?: string;
  body?: any;
  headers?: StringMap;
  error: any | null;
}

/**
 * Mocked HttpService that can be used for unit testing.
 * It allows you to specify what response should be returned to the request or simulate client-side errors.
 */
export class MockHttpService implements HttpService {
  get requestOptions(): HttpRequestOptions | null {
    return this._requestOptions;
  }
  
  /** Initializes a new MockHttpService instance. */
  constructor() {
    this._requestOptions = null;
    this._responseOptions = {
      status: 200,
      body: {},
      error: null,
    };
  }

  private _requestOptions: HttpRequestOptions | null;
  private _responseOptions: HttpResponseOptions;

  /**
   * Specifies an HTTP response that should be returned to the following request.
   * @param body Optional body to be returned in the response
   * @param status HTTP Status code; default is 200
   * @param statusText Optional status text
   * @param headers Optional headers to be returned in the response
   */
  response(body: any = {}, status: number = 200, statusText?: string, headers?: StringMap) {
    this._responseOptions = { body, status, statusText, error: null, headers };
  }

  /**
   * Makes the following request throw a given client-side error.
   * @param error The ErrorEvent object to be returned in the HttpErrorResponse
   */
  clientError(error: ErrorEvent) {
    this._responseOptions = { status: 0, body: null, headers: undefined, error };
  }

  /**
   * Simulates network offline error.
   */
  offline() {
    this._responseOptions = {
      body: null,
      status: 0,
      statusText: 'Unknown Error',
      error: new ProgressEvent('error', { loaded: 0, lengthComputable: false, total: 0 })
    };
  }

  request(options: HttpRequestOptions): Observable<any> {
    if (!options) {
      throw new Error('Invalid request data');
    }

    this._requestOptions = options;

    const { status, statusText, body, error, headers } = this._responseOptions;

    if (status >= 200 && status < 400) {
      return of(body);
    }

    return throwError(new HttpErrorResponse({
      url: this._requestOptions.url,
      status,
      statusText,
      error: body || error,
      headers,
    }));
  }
}
