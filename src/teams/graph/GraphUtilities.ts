export class GraphUtilities {
  public static buildQueryString(params?: Record<string, string | number | boolean>): string {
    if (!params) return '';
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        query.append(key, String(val));
      }
    });
    const str = query.toString();
    return str ? `?${str}` : '';
  }

  public static formatBatchRequest(requests: { id: string; method: string; url: string }[]): any {
    return {
      requests: requests.map(r => ({
        id: r.id,
        method: r.method,
        url: r.url
      }))
    };
  }
}
