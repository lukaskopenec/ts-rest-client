import { NamedValues } from './named-values';

/** HTTP Method to be used in the request. */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD';

/**
 * HTTP Request options.
 *  - url: required request URL
 *  - method: required request method (e.g. GET)
 *  - body: optional content to be sent as the request body
 *  - headers: optional HTTP headers to be added to the request
 *  - params: optional query parameters to be sent along with the request
 */
export class HttpRequestOptions {
  constructor(
    readonly url: string,
    readonly method: HttpMethod,
    readonly body: any = null,
    readonly headers: NamedValues = null,
    readonly params: NamedValues = null,
  ) {
    const empty = new NamedValues();
    this.headers = new NamedValues((headers || empty).values);
    this.params = new NamedValues((params || empty).values);

    if (!this.headers.contains('Content-Type')) {
      this.headers.set('Content-Type', this.getContentType());
    }

    if (!this.headers.contains('Accepts')) {
      this.headers.set('Accepts', 'application/json, text/plain, */*');
    }
  }

  /**
   * Detects the content type from the request body.
   */
  getContentType(): string {
    const specifiedType = this.headers.get('Content-Type');
    if (specifiedType) {
      return specifiedType;
    }

    if (!this.body || typeof this.body === 'object') {
      return 'application/json';
    }

    return 'text/plain';
  }

  /**
   * Returns the body serialized into a string.
   */
  getSerializedBody(): string {
    if (!this.body) {
      return null;
    }

    if (this.getContentType() === 'application/json') {
      return JSON.stringify(this.body);
    }

    return this.body.toString();
  }

  /**
   * Gets the request URL including eventual query string.
   */
  getUrl(): string {
    if (!this.params.length) {
      return this.url;
    }

    const paramsString = Object
      .keys(this.params.values)
      .map(p => `${standardQueryEncoding(p)}=${standardQueryEncoding(this.params.values[p])}`)
      .join('&');

    const queryIndex = this.url.indexOf('?');
    const separator = queryIndex < 0 ? '?' : (queryIndex < this.url.length - 1 ? '&' : '');

    return `${this.url}${separator}${paramsString}`;
  }
}

function standardQueryEncoding(v: string): string {
  return encodeURIComponent(v)
    .replace(/%40/gi, '@')
    .replace(/%3A/gi, ':')
    .replace(/%24/gi, '$')
    .replace(/%2C/gi, ',')
    .replace(/%3B/gi, ';')
    .replace(/%2B/gi, '+')
    .replace(/%3D/gi, '=')
    .replace(/%3F/gi, '?')
    .replace(/%2F/gi, '/');
}
