import { HttpErrorResponse } from './http-error-response';

describe('HttpErrorResponse', () => {
  it('HttpErrorResponse constructor can accept empty initializer', () => {
    const error = new HttpErrorResponse(undefined as any);

    expect(error.status).toBe(0);
    expect(error.headers).toEqual({});
    expect(error.statusText).toBe('');
    expect(error.url).toBeUndefined();
    expect(error.message).toBe('Http failure response for (unknown url): 0 ');
    expect(error.error).toBeNull();
  });

  it('HttpErrorResponse is correctly initialized', () => {
    const error = new HttpErrorResponse({
      error: { message: 'Oh no' },
      headers: { MyHeader: 'My value' },
      status: 400,
      statusText: 'Bummer',
      url: 'http://errors.net/oh-snap',
    });

    expect(error.status).toBe(400);
    expect(error.headers).toEqual({ MyHeader: 'My value' });
    expect(error.statusText).toBe('Bummer');
    expect(error.url).toBe('http://errors.net/oh-snap');
    expect(error.message).toBe('Http failure response for http://errors.net/oh-snap: 400 Bummer');
    expect(error.error).toEqual({ message: 'Oh no' });
  });

  it('HttpErrorResponse indicates parsing error when status is between 200 and 300', () => {
    const error = new HttpErrorResponse({
      headers: { MyHeader: 'My value' },
      status: 200,
      url: 'http://errors.net/oh-snap',
    });

    expect(error.status).toBe(200);
    expect(error.headers).toEqual({ MyHeader: 'My value' });
    expect(error.url).toBe('http://errors.net/oh-snap');
    expect(error.message).toBe('Http failure during parsing for http://errors.net/oh-snap');
    expect(error.error).toBeNull();
  });

  it('HttpErrorResponse indicates parsing error when status is between 200 and 300', () => {
    const error = new HttpErrorResponse({
      headers: { MyHeader: 'My value' },
      status: 200,
    });

    expect(error.status).toBe(200);
    expect(error.headers).toEqual({ MyHeader: 'My value' });
    expect(error.message).toBe('Http failure during parsing for (unknown url)');
    expect(error.error).toBeNull();
  });
});
