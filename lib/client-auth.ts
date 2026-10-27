export async function fetchWithAuth(input: string, init?: RequestInit) {
  let response = await fetch(input, init);
  if (response.status === 401) {
    const renewed = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    if (renewed.ok) response = await fetch(input, init);
  }
  return response;
}
