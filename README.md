# ts-rest-client

Generic service for consuming RESTful API using Typescript decorators. Though the idea comes from the [angular2-rest](https://github.com/Paldom/angular2-rest) package, I abstracted it a bit more so that it is not dependent on Angular and so that it supports easier unit testing.

## Backends

To decouple the REST client from a concrete XHR engine, the client just collects the data needed for creating an HTTP request and then passes those to an interface called `HttpService` which is then responsible for executing the actual request, parsing the response and returning the data back. Actually there are the following backends implemented:

 - `ts-rest-client-raw` (in progress): Raw implementation using native [XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest)
 - `ts-rest-client-angular` (in progress): Angular implementation using [HttpClient](https://angular.io/api/common/http/HttpClient)
 - [`ts-rest-client-fetch`](https://npmjs.com/package/ts-rest-client-fetch): Implementation using [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

Besides that the base `ts-rest-client` package contains a mocked `MockHttpService` that can help you with writing your unit tests.

If you need to implement a different backend, all you need to do is to implement the `HttpService` interface and pass that implementation to the `RestClient` constructor.

## Installation

`npm install ts-rest-client`

## Example

Using Typescript decorators you define a proxy to your API. Using the `RestClient` constructor you pass the concrete [backend](#backends) as an argument.

```ts
import {
  BaseUrl,
  Body,
  DefaultHeaders,
  DELETE,
  GET,
  HEAD,
  Headers,
  Path,
  POST,
  PUT,
  Query,
  RestClient,
} from './rest-client';

import { CreateUserData, User } from 'src/models/user';

@BaseUrl('https://reqres.in/api')
@DefaultHeaders({
  Accepts: 'application/json'
})
class UsersApiClient extends RestClient {
  constructor() {
    super(new MockHttpService());
  }

  @GET('/users')
  listUsers(@Query('page') _page: number): Observable<User[]> { return null; }

  @POST('/users')
  createUser(@Body _userData: CreateUserData): Observable<User> { return null; }

  @PUT('/users/{id}')
  updateUser(@Path('id') _id: number, @Body _userData: CreateUserData): Observable<User> { return null; }

  @DELETE('/users/{id}')
  deleteUser(@Path('id') _id: number): Observable<void> { return null; }

  @HEAD('/test-head')
  @Headers({
    MyHeader: 215
  })
  testHead(): Observable<void> { return null; }
}
```

Then having the instance of the proxy, you just simply call its methods. Under the hood the call is transformed to an HTTP request and you get an observable that returns the parsed response body once the request completes. If an error occurs, you get an instance of `HttpErrorResponse` with details about what happened:

```ts
function callApi(usersApi: UsersApiClient) {
  usersApi.createUser({ name: 'morpheus', job: 'leader' }).subscribe(
    user => console.log('User has been created: ', user),
    err => err.error instanceof Event ?
      console.error('Client-side error', err.error) :
      console.error('Request processing failed on server', err.status, err.error)
  );
}
```

## API

As shown in the example you define your API proxy by inheriting from the
### RestClient class
#### Methods:
- `getBaseUrl(): string`: returns the base url of RestClient
- `getDefaultHeaders(): StringMap`: returns the default headers of RestClient in a key-value pair

### Class decorators
- `@BaseUrl(url: string)`: Defines the base URL of your API, this will be prepended to the path of every method
- `@DefaultHeaders(headers: StringMap)`: Defines default headers that will be added to each request; you can override or append individual headers on the method level

### Method decorators:
- `@GET(url: string)`: Indicates that the method is a GET request to a given URL
- `@POST(url: string)`: Indicates that the method is a POST request to a given URL
- `@PUT(url: string)`: Indicates that the method is a PUT request to a given URL
- `@DELETE(url: string)`: Indicates that the method is a DELETE request to a given URL
- `@HEAD(url: string)`: Indicates that the method is a HEAD request to a given URL
- `@Headers(headers: Object)`: Additional headers to be added to the request (or override the default)

### Parameter decorators:
- `@Path(key: string)`: Value of the parameter will be inserted into the URL of the method replacing the corresponding `{key}` placeholder
- `@Query(key: string)`: Value of the parameter will be inserted into the query string of the request under the given `key`
- `@Header(key: string)`: Value of the parameter will be inserted into the request headers under the given `key`
- `@Body`: Value of the parameter will be sent as the body of the request

### HttpErrorResponse
When something goes wrong, either the server fails to process your request or there is e.g. a network failure, the observable throws an HttpErrorResponse instance filled with the details about the problem.

It implements the [Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error) interface and extends it with the following fields
- `headers: StringMap` any eventual response headers
- `status: number` eventual HTTP status code
- `statusText: string` eventual HTTP status text
- `url: string` URL of the original request
- `error: Event | any | null` in case of a server error, it contains the parsed response body (if any), in case of a client-side error it contains an error [Event](https://developer.mozilla.org/en-US/docs/Web/API/Event) returned by the backend.

### MockHttpService
This is a mocked backend that can be passed to the RestClient to simplify writing unit tests for the frontend. It basically allows you to define the response for the subsequent request(s) so that you can simulate different situations that your code has to deal with.

#### Properties
 - `requestOptions: HttpRequestOptions`: returns the data of the last request

#### Methods
 - `response(body: any = {}, status: number = 200, statusText?: string, headers?: StringMap)`: Defines an HTTP response that will be sent for subsequent request(s).
 - `clientError(error: Event)`: Defines a client-side error that will be returned for subsequent request(s)
 - `offline()`: Simulates a network-offline condition 

### Utility classes
- `StringMap`: an interface for an object containing key-value pairs where both the key and the value are strings
- `HttpService`: an interface for the [backend](#backends)
- `HttpRequestOptions`: data collected by the RestClient for creating the actual HTTP request, includes methods for basic request formatting