// Helper for GitHub Pages root domain (hoangthanhdat02.github.io)
export const isProd = process.env.NODE_ENV === 'production';
export const BASE_PATH = '';

export function getAssetPath(path: string): string {
  if (!path) return '';
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:') ||
    path.startsWith('blob:')
  ) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  // Prevent double prefixing if already prefixed
  if (cleanPath.startsWith(BASE_PATH) && BASE_PATH !== '') {
    return cleanPath;
  }
  return `${BASE_PATH}${cleanPath}`;
}
