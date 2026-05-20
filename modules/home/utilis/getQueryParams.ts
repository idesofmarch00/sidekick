export function getQueryParam(url: string, param: string): string | null {
  // Split URL into base and query parts
  const queryStartIndex = url.indexOf('?');
  if (queryStartIndex === -1) {
    return null;
  }

  // Extract query string
  const queryString = url.substring(queryStartIndex + 1);

  // Parse query parameters
  const params: Record<string, string> = {};
  const pairs = queryString.split('&');

  for (const pair of pairs) {
    const [key, value] = pair.split('=');
    if (!key) {
      continue;
    }

    // Decode URI components and handle empty values
    const decodedKey = decodeURIComponent(key);
    const decodedValue = decodeURIComponent(value || '');

    params[decodedKey] = decodedValue;
  }

  return params[param] || null;
}
// Example usage
const url = 'https://sidekick-backend-279t.onrender.com/scooter?regno=SCOOTER1';
const regno = getQueryParam(url, 'regno');
console.log(regno); // Output: "SCOOTER1"
