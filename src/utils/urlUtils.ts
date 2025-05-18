
// URL utilities for handling CDN URLs

// Ensure URL is a valid CDN URL
export const ensureValidCdnUrl = (url: string): string => {
  // Ensure the URL is absolute
  if (!url.startsWith('http')) {
    // Use base URL from Supabase
    return `https://hhfbxftaburyxxjcomto.supabase.co${url.startsWith('/') ? url : '/' + url}`;
  }
  return url;
};

// Format a URL for sharing by ensuring it's absolute and clean
export const formatShareableUrl = (url: string): string => {
  // Ensure the URL is absolute
  let cdnUrl = ensureValidCdnUrl(url);
  
  // Remove any query parameters if present
  return cdnUrl.split('?')[0];
};
