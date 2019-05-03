import { HttpRequestOptions } from './http-request-options';
import { NamedValues } from './named-values';

describe('HttpRequestOptions', () => {
  it('Correctly serializes the query string and appends it to the URL', () => {
    const params = new NamedValues({
      MyValue: '1+5=6',
      Names: 'Jeremy Bishop & Jane Lawrence',
      url: 'https://example.com/query-string',
    });
    const serialized = 'MyValue=1%2B5%3D6&Names=Jeremy%20Bishop%20%26%20Jane%20Lawrence&url=https%3A%2F%2Fexample.com%2Fquery-string';
    let url = 'http://test.com/page';

    let options = new HttpRequestOptions(url, 'GET', null, null, params);

    expect(options.getUrl()).toBe(`${url}?${serialized}`);

    url += '?';
    options = new HttpRequestOptions(url, 'GET', null, null, params);

    expect(options.getUrl()).toBe(`${url}${serialized}`);

    url += 'MyParam=MyValue';
    options = new HttpRequestOptions(url, 'GET', null, null, params);

    expect(options.getUrl()).toBe(`${url}&${serialized}`);

    options = new HttpRequestOptions(url, 'GET');

    expect(options.getUrl()).toBe(url);
  });

  it('Retrieves the content-type header or detects it', () => {
    let options = new HttpRequestOptions('', 'POST', { name: 'value' });

    expect(options.getContentType()).toBe('application/json');

    options = new HttpRequestOptions('', 'POST');

    expect(options.getContentType()).toBe('application/json');

    options = new HttpRequestOptions('', 'POST', 'Text body');

    expect(options.getContentType()).toBe('text/plain');

    options = new HttpRequestOptions('', 'POST', 42);

    expect(options.getContentType()).toBe('text/plain');

    options = new HttpRequestOptions('', 'POST', { name: 'value' }, new NamedValues({ 'Content-Type': 'custom' }));

    expect(options.getContentType()).toBe('custom');
  });

  it('Serializes the body according to the content/type', () => {
    let options = new HttpRequestOptions('', 'POST', { name: 'value' });

    expect(JSON.parse(options.getSerializedBody())).toEqual({ name: 'value' });

    options = new HttpRequestOptions('', 'POST', 'Text body');

    expect(options.getSerializedBody()).toBe('Text body');

    options = new HttpRequestOptions('', 'POST', 42);

    expect(options.getSerializedBody()).toBe('42');

    options = new HttpRequestOptions('', 'POST');

    expect(options.getSerializedBody()).toBeNull();
  });
});
