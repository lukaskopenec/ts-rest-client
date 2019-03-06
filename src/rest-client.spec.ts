import { Observable } from 'rxjs';

import { MockHttpService } from './mock-http-service';
import { StringMap } from './named-values';
import {
  BaseUrl,
  Body,
  DefaultHeaders,
  DELETE,
  GET,
  HEAD,
  Header,
  Headers,
  HttpRequestInterceptor,
  PATCH,
  Path,
  POST,
  PUT,
  Query,
  RestClient,
} from './rest-client';

const baseUrl = 'http://example.org/api';

const defaultHeaders = {
  Accepts: 'application/json',
};

const expectedHeaders = {
  ...defaultHeaders,
  'Content-Type': 'application/json',
};

const additionalHeaders = {
  MethodHeader: 'header 1',
  ParamHeader: 'header 2',
};

@BaseUrl(baseUrl)
@DefaultHeaders(defaultHeaders)
class TestingRestClient extends RestClient {
  get baseUrl(): string | null {
    return this.getBaseUrl();
  }

  get defaultHeaders(): StringMap | null {
    return this.getDefaultHeaders();
  }

  get mockService(): MockHttpService {
    return this.httpClient as MockHttpService;
  }

  constructor() {
    super(new MockHttpService());
  }

  setRequestInterceptor(interceptor: HttpRequestInterceptor) {
    this.requestInterceptor = interceptor;
  }

  @GET('/test-get')
  testGet(): Observable<any> { return null; }

  @POST('/test-post/{id}/endpoint')
  testPost(@Body _body: any, @Path('id') _id: number): Observable<any> { return null; }

  @PUT('/test-put')
  testPut(@Query('id') _id: string, @Query('href') _href: any): Observable<any> { return null; }

  @DELETE('/test-delete')
  testDelete(@Header('myHeader') _headerParam: string): Observable<any> { return null; }

  @HEAD('/test-head')
  @Headers(additionalHeaders)
  testHead(): Observable<any> { return null; }

  @PATCH('/test-patch')
  testPatch(): Observable<any> { return null; }
}

describe('RestClient', () => {
  const restClient = new TestingRestClient();

  it('Base URL is properly set', () => {
    expect(restClient.baseUrl).toBe(baseUrl);
  });

  it('Default headers are properly set', () => {
    expect(restClient.defaultHeaders).toEqual(defaultHeaders);
  });

  it('@GET() generates a GET HTTP Request to a correct URL', () => {
    restClient.testGet();
    const request = restClient.mockService.requestOptions;

    expect(request.method).toBe('GET');
    expect(request.url).toBe(`${baseUrl}/test-get`);
    expect(request.headers.values).toEqual(expectedHeaders);
  });

  it('@POST() generates a POST HTTP request with given body. @PATH() correctly modifies URL.', () => {
    const body = { message: 'yay' };
    restClient.testPost(body, 5);
    const request = restClient.mockService.requestOptions;

    expect(request.method).toBe('POST');
    expect(request.url).toBe(`${baseUrl}/test-post/5/endpoint`);
    expect(JSON.parse(request.body)).toEqual(body);
  });

  it('@PUT() generates a PUT HTTP request. @Query() generates query parameters', () => {
    restClient.testPut('abraka', { url: 'https://dabraka.com/' });
    const request = restClient.mockService.requestOptions;

    expect(request.method).toBe('PUT');
    expect(request.url).toBe(`${baseUrl}/test-put`);
    expect(request.params.values.id).toBe('abraka');
    expect(JSON.parse(request.params.values.href as string)).toEqual({
      url: 'https://dabraka.com/',
    });
  });

  it('@DELETE() generates a DELETE HTTP request. @Header() modifies request headers', () => {
    restClient.testDelete('myValue');
    const request = restClient.mockService.requestOptions;

    expect(request.method).toBe('DELETE');
    expect(request.url).toBe(`${baseUrl}/test-delete`);
    expect(request.headers.values).toEqual({
      ...expectedHeaders,
      myHeader: 'myValue',
    });
  });

  it('@HEAD() generates a HEAD HTTP request. @Headers() modifies request headers.', () => {
    restClient.testHead();
    const request = restClient.mockService.requestOptions;

    expect(request.method).toBe('HEAD');
    expect(request.url).toBe(`${baseUrl}/test-head`);
    expect(request.headers.values).toEqual({
      ...expectedHeaders,
      ...additionalHeaders,
    });
  });

  it('@PATCH() generates a PATCH HTTP request.', () => {
    restClient.testPatch();
    const request = restClient.mockService.requestOptions;

    expect(request.method).toBe('PATCH');
    expect(request.url).toBe(`${baseUrl}/test-patch`);
  });

  it('requestInterceptor receives the request before sending and can modify it', () => {
    restClient.setRequestInterceptor(req => {
      req.headers.set('Authorization', 'Bearer or Bear?');
      return req;
    });
    restClient.testGet();
    const request = restClient.mockService.requestOptions;

    expect(request.headers.get('Authorization')).toBe('Bearer or Bear?');
  });
});
