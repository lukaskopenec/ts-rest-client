
// tslint:disable:ban-types
import { NamedValues, StringMap } from './named-values';
import { HttpService, HttpMethod, HttpRequestOptions } from './http-service';

interface Parameter {
  key: string;
  parameterIndex: number;
}

/**
 * An interceptor is a function that takes the prepared HTTP request data and returns them modified.
 */
export type HttpRequestInterceptor = (request: HttpRequestOptions) => HttpRequestOptions;

/**
 * Abstract base class for the REST clients.
 */
export abstract class RestClient {
  protected httpClient: HttpService;

  constructor(httpClient: HttpService) {
    this.httpClient = httpClient;
    this.requestInterceptor = null;
  }

  /**
   * Request interceptor allowing to modifiy the collected request data before sending it.
   * Typical use is the insertion of an authorization token to the request headers.
   * Leave null if you don't want to use it.
   */
  protected requestInterceptor: HttpRequestInterceptor | null;

  /**
   * Returns the base of the REST API URL.
   */
  protected getBaseUrl(): string | null {
    return null;
  }

  /**
   * Returns the default HTTP headers attached to each request.
   */
  protected getDefaultHeaders(): StringMap | null {
    return null;
  }
}

/**
 * Sets the default HTTP headers attached to each request to the REST API.
 * Intended to use as a decorator: @DefaultHeaders({'Header': 'value', 'Header2': 'value'}
 * @param headers   The headers in key-value pairs.
 */
export function DefaultHeaders(headers: StringMap): any {
  return function <TFunc extends Function>(Target: TFunc): TFunc {
    Target.prototype.getDefaultHeaders = function(): StringMap {
      return headers;
    };

    return Target;
  };
}

/**
 * Sets the base URL of the REST API.
 * Intended to use as a decorator: @BaseUrl("http://...")
 * @param url   the base URL.
 */
export function BaseUrl(url: string): any {
  return function <TFunc extends Function>(Target: TFunc): TFunc {
    Target.prototype.getBaseUrl = function (): any {
      return url;
    };
    return Target;
  };
}

function paramBuilder(paramName: string): any {
  return function (key: string): any {
    return function (target: any, propertyKey: string | symbol, parameterIndex: number): any {
      const metadataKey = `${String(propertyKey)}_${paramName}_parameters`;
      const paramObj: Parameter = {
        key,
        parameterIndex,
      };

      if (Array.isArray(target[metadataKey])) {
        target[metadataKey].push(paramObj);
      } else {
        target[metadataKey] = [paramObj];
      }
    };
  };
}

/**
 * Path variable of a method's URL, type: string.
 * @param key   path key to bind value.
 */
export let Path = paramBuilder('Path');

/**
 * Query value of a method's URL, type: string.
 * @param key   query key to bind value.
 */
export let Query = paramBuilder('Query');

/**
 * Body of a REST method, type: key-value pair object.
 * Only one body per method!
 */
export let Body = paramBuilder('Body')('Body');

/**
 * Custom header of a REST method, type: string.
 * @param key   header key to bind value.
 */
export let Header = paramBuilder('Header');

/**
 * Set custom headers for a REST method.
 * @param headersDef    custom headers in key-value pairs.
 */
export function Headers(headersDef: Headers): any {
  return function (_target: RestClient, _propertyKey: string, descriptor: any): any {
    descriptor.headers = headersDef;
    return descriptor;
  };
}

function methodBuilder(method: HttpMethod): any {
  return function (url: string): any {
    return function (target: any, propertyKey: string, descriptor: any): any {
      const pPath = target[`${propertyKey}_Path_parameters`] as Parameter[];
      const pQuery = target[`${propertyKey}_Query_parameters`] as Parameter[];
      const pBody = target[`${propertyKey}_Body_parameters`] as Parameter[];
      const pHeader = target[`${propertyKey}_Header_parameters`] as Parameter[];

      descriptor.value = function (...args: any[]): any {
        let body = null;
        if (pBody) {
          body = JSON.stringify(args[pBody[0].parameterIndex]);
        }

        let resUrl: string = url;
        if (pPath) {
          for (const k in pPath) {
            if (pPath.hasOwnProperty(k)) {
              resUrl = resUrl.replace('{' + pPath[k].key + '}', args[pPath[k].parameterIndex]);
            }
          }
        }

        let params = new NamedValues();
        if (pQuery) {
          pQuery
            .filter(p => args[p.parameterIndex])
            .forEach(p => {
              const key = p.key;
              let value = args[p.parameterIndex];
              if (value instanceof Object) {
                value = JSON.stringify(value);
              }
              params.set(key, value);
            });
        }

        const headers = new NamedValues(this.getDefaultHeaders());
        for (const k in descriptor.headers) {
          if (descriptor.headers.hasOwnProperty(k)) {
            headers.set(k, descriptor.headers[k]);
          }
        }
        if (pHeader) {
          for (const k in pHeader) {
            if (pHeader.hasOwnProperty(k)) {
              headers.set(pHeader[k].key, args[pHeader[k].parameterIndex]);
            }
          }
        }

        const finalUrl = this.getBaseUrl() + resUrl;
        let request = { url: finalUrl, method, body, headers, params };
        if (this.requestInterceptor) {
          request = this.requestInterceptor(request);
        }

        return (<HttpService>this.httpClient).request(request);
      };
    };
  };
}

/**
 * GET method.
 * @param url   resource URL of the method
 */
export let GET = methodBuilder('GET');

/**
 * POST method.
 * @param url   resource URL of the method
 */
export let POST = methodBuilder('POST');

/**
 * PUT method.
 * @param url   resource URL of the method
 */
export let PUT = methodBuilder('PUT');

/**
 * DELETE method.
 * @param url   resource URL of the method
 */
export let DELETE = methodBuilder('DELETE');

/**
 * HEAD method.
 * @param url   resource URL of the method
 */
export let HEAD = methodBuilder('HEAD');
