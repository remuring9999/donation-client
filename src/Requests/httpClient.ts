class httpClient {
  private requestsOptions: RequestInit;

  constructor(requestsOptions: RequestInit) {
    this.requestsOptions = requestsOptions;
  }

  async get(url: string, requestsOptions?: RequestInit) {
    const response = await fetch(url, {
      ...this.requestsOptions,
      ...requestsOptions,
      headers: {
        ...this.requestsOptions.headers,
        ...requestsOptions?.headers,
      },
      method: "GET",
    });

    return response;
  }

  async post(url: string, body?: URLSearchParams, requestsOptions?: any) {
    const response = await fetch(url, {
      ...this.requestsOptions,
      ...requestsOptions,
      headers: {
        ...this.requestsOptions.headers,
        ...(body
          ? { "content-type": "application/x-www-form-urlencoded" }
          : {}),
        ...requestsOptions?.headers,
      },
      body,
      method: "POST",
    });

    return response;
  }
}

export default httpClient;
