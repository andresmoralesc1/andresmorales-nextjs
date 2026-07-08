// Resolve image URL: prefer local /uploads, fall back to WP for anything not migrated
export const wpImage = (path: string) => {
  if (path.startsWith('http')) return path;
  const localPath = `/uploads${path.replace(/^\/wp-content\/uploads/, '')}`;
  return localPath;
};
