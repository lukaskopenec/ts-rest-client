import { HttpErrorResponse } from './http-error-response';
import { HttpRequestOptions } from './http-service';
import { MockHttpService } from './mock-http-service';
import { NamedValues } from './named-values';

describe('Mock HttpService', () => {
  const service = new MockHttpService();
  const request: HttpRequestOptions = {
    body: { message: 'Hello' },
    headers: new NamedValues({ Authorization: 'Bearer... or bear?' }),
    method: 'POST',
    url: 'http://example.org/some/endpoint',
  };

  it('requestOptions should be null before the first request', () => {
    expect(service.requestOptions).toBeNull();
  });

  it('request should get a 200 response with {} body and request options should get the last request data', () => {
    let response: any;
    service.request(request).subscribe(res => response = res);

    expect(service.requestOptions).toEqual(request);
    expect(response).toEqual({});
  });

  it('request should throw an error when no request data is passed', () => {
    expect(() => service.request(undefined as any)).toThrow();
  });

  it('request should return the specified response body', () => {
    const body = { message: 'Hey, it works!' };
    service.response(body);

    let response: any;
    service.request(request).subscribe(res => response = res);

    expect(response).toEqual(body);
  });

  it('request should get a 200 response with {} body', () => {
    service.response();

    let response: any;
    service.request(request).subscribe(res => response = res);

    expect(service.requestOptions).toEqual(request);
    expect(response).toEqual({});
  });

  it('request should throw an HttpErrorResponse with specified body', () => {
    const body = { message: 'Oh, shit happens, you know' };
    service.response(body, 404, 'Bad Request');

    let response: any;
    service.request(request).subscribe(
      () => { throw new Error('Bummer, request should have thrown'); },
      err => response = err,
    );

    expect(response instanceof HttpErrorResponse).toBeTruthy();
    expect(response.error).toEqual(body);
    expect(response.status).toBe(404);
    expect(response.statusText).toBe('Bad Request');
  });

  it('request should throw an HttpErrorResponse with a ProgressEvent when simulating offline mode', () => {
    service.offline();

    let response: any;
    service.request(request).subscribe(
      () => { throw new Error('Bummer, request should have thrown'); },
      err => response = err,
    );

    expect(response instanceof HttpErrorResponse).toBeTruthy();
    expect(response.error instanceof Event).toBeTruthy();
    expect(response.error instanceof ProgressEvent).toBeTruthy();
    expect(response.status).toBe(0);
  });

  it('request should throw an HttpErrorResponse with a specified error', () => {
    const error = new ErrorEvent('error', { error: 'My error' });
    service.clientError(error);

    let response: any;
    service.request(request).subscribe(
      () => { throw new Error('Bummer, request should have thrown'); },
      err => response = err,
    );

    expect(response instanceof HttpErrorResponse).toBeTruthy();
    expect(response.error).toEqual(error);
    expect(response.status).toBe(0);
  });
});
