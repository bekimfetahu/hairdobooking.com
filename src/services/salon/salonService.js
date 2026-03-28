export async function fetchSalonBySlug(slug) {
  const response = await fetch("/api", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      method: "get",
      access_type: "laravelApp",
      url: `client/salons/${slug}`,
      data: {},
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Failed to load salon");
  }

  return data;
}
