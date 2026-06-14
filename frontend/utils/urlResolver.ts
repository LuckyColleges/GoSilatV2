import { Config } from '../constants/config'

/**
 * Resolves an image URL to handle:
 * 1. Relative paths starting with /uploads
 * 2. Absolute URLs with outdated hosts (e.g. old IPs or localhost)
 */
export const resolveImageUrl = (url?: string) => {
  if (!url) return null

  const currentHost = Config.API_BASE_URL.split('/api')[0]

  // If it's a relative path
  if (url.startsWith('/uploads')) {
    return `${currentHost}${url}`
  }

  // If it's an absolute URL
  if (url.startsWith('http')) {
    // If it contains /uploads/, it's one of our files
    // We should ensure it uses the current host from Config
    if (url.includes('/uploads/')) {
      const path = url.split('/uploads/')[1]
      return `${currentHost}/uploads/${path}`
    }
    return url
  }

  return url
}
