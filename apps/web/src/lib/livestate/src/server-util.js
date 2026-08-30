export async function fetchData(endpoint, { authToken, defaultValue = [], options = {} } = {}) {
  try {
    const baseUrl =
      process.env.BACKEND_API_URL ||
      process.env.NEXT_PUBLIC_LIVESTATE_URL ||
      "https://livestate.imsergioh.me";
    const headers = authToken
      ? { Authorization: `Bearer ${authToken}`, ...options.headers }
      : options.headers;

    const response = await fetch(`${baseUrl.replace(/\/$/, "")}${endpoint}`, {
      ...options,
      headers,
      cache: "no-store",
    });

    if (!response.ok) return defaultValue;
    return await response.json();
  } catch {
    return defaultValue;
  }
}