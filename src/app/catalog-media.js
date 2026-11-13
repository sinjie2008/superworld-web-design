const publicMediaPath = "/api/media/public.php?path=";
const publicMediaAlias = /^__library__\/[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}\/[^/\\\u0000-\u001f]+$/i;

export function catalogMediaUrl(value) {
  if (typeof value !== "string" || !value.startsWith(publicMediaPath)) return null;
  const params = new URLSearchParams(value.slice("/api/media/public.php?".length));
  const path = params.get("path");
  if (params.size !== 1 || !path || !publicMediaAlias.test(path)) return null;
  if ([".", ".."].includes(path.split("/").at(-1))) return null;
  return publicMediaPath + encodeURIComponent(path);
}
