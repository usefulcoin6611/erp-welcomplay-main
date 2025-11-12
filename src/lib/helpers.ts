export function toAbsoluteUrl(pathname: string) {
  // Minimal helper used by template assets — return as-is when already absolute
  if (!pathname) return pathname
  return pathname.startsWith('/') ? pathname : `/${pathname}`
}
