// SEO utilities and structured data generation
export interface SEOData {
  title: string;
  description: string;
  keywords?: string[];
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  url: string;
  image?: string;
  type?: 'website' | 'article' | 'blog';
  siteName?: string;
}

export interface BlogPostSEO extends SEOData {
  type: 'article';
  author: string;
  publishedTime: string;
  modifiedTime?: string;
  tags?: string[];
  category?: string;
  readingTime?: number;
}

// Generate JSON-LD structured data
export const generateStructuredData = (data: SEOData | BlogPostSEO) => {
  const baseStructuredData = {
    '@context': 'https://schema.org',
    '@type': data.type === 'article' ? 'BlogPosting' : 'WebSite',
    name: data.title,
    headline: data.title,
    description: data.description,
    url: data.url,
    ...(data.image && { image: data.image }),
    ...(data.siteName && { publisher: { '@type': 'Organization', name: data.siteName } })
  };

  if (data.type === 'article') {
    const blogData = data as BlogPostSEO;
    return {
      ...baseStructuredData,
      '@type': 'BlogPosting',
      author: {
        '@type': 'Person',
        name: blogData.author
      },
      datePublished: blogData.publishedTime,
      ...(blogData.modifiedTime && { dateModified: blogData.modifiedTime }),
      ...(blogData.tags && { keywords: blogData.tags.join(', ') }),
      ...(blogData.category && { articleSection: blogData.category }),
      ...(blogData.readingTime && { 
        timeRequired: `PT${blogData.readingTime}M`,
        readingTime: `${blogData.readingTime} min read`
      }),
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': blogData.url
      }
    };
  }

  return baseStructuredData;
};

// Generate Open Graph meta tags
export const generateOpenGraphTags = (data: SEOData | BlogPostSEO) => {
  const tags = [
    { property: 'og:title', content: data.title },
    { property: 'og:description', content: data.description },
    { property: 'og:url', content: data.url },
    { property: 'og:type', content: data.type === 'article' ? 'article' : 'website' },
    ...(data.image ? [{ property: 'og:image', content: data.image }] : []),
    ...(data.siteName ? [{ property: 'og:site_name', content: data.siteName }] : [])
  ];

  if (data.type === 'article') {
    const blogData = data as BlogPostSEO;
    tags.push(
      { property: 'article:published_time', content: blogData.publishedTime },
      { property: 'article:author', content: blogData.author },
      ...(blogData.tags ? blogData.tags.map(tag => ({ property: 'article:tag', content: tag })) : []),
      ...(blogData.category ? [{ property: 'article:section', content: blogData.category }] : [])
    );
  }

  return tags;
};

// Generate Twitter Card meta tags
export const generateTwitterTags = (data: SEOData | BlogPostSEO) => {
  return [
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: data.title },
    { name: 'twitter:description', content: data.description },
    ...(data.image ? [{ name: 'twitter:image', content: data.image }] : []),
    { name: 'twitter:site', content: '@cloudmanual' }, // Update with your Twitter handle
    { name: 'twitter:creator', content: '@cloudmanual' }
  ];
};

// Generate canonical and alternate links
export const generateLinkTags = (data: SEOData | BlogPostSEO) => {
  return [
    { rel: 'canonical', href: data.url },
    // Add alternate language versions if you support i18n
    // { rel: 'alternate', hreflang: 'en', href: data.url },
    // { rel: 'alternate', hreflang: 'es', href: `${data.url}?lang=es` }
  ];
};

// SEO audit function
export const auditSEO = (data: SEOData | BlogPostSEO) => {
  const issues: string[] = [];
  const suggestions: string[] = [];

  // Title checks
  if (!data.title) {
    issues.push('Missing title');
  } else if (data.title.length < 30) {
    suggestions.push('Title could be longer (30-60 characters recommended)');
  } else if (data.title.length > 60) {
    issues.push('Title too long (60+ characters may be truncated)');
  }

  // Description checks
  if (!data.description) {
    issues.push('Missing meta description');
  } else if (data.description.length < 120) {
    suggestions.push('Description could be longer (120-160 characters recommended)');
  } else if (data.description.length > 160) {
    issues.push('Description too long (160+ characters may be truncated)');
  }

  // Image checks
  if (!data.image) {
    suggestions.push('Consider adding an Open Graph image');
  }

  // Keywords checks
  if (data.keywords && data.keywords.length === 0) {
    suggestions.push('Consider adding relevant keywords');
  }

  // Article-specific checks
  if (data.type === 'article') {
    const blogData = data as BlogPostSEO;
    if (!blogData.author) {
      issues.push('Missing author information');
    }
    if (!blogData.publishedTime) {
      issues.push('Missing publication date');
    }
    if (!blogData.tags || blogData.tags.length === 0) {
      suggestions.push('Consider adding tags for better categorization');
    }
  }

  return {
    score: Math.max(0, 100 - (issues.length * 20) - (suggestions.length * 5)),
    issues,
    suggestions
  };
};

// Sitemap generation utilities
export interface SitemapEntry {
  url: string;
  lastModified: string;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

export const generateSitemapXML = (entries: SitemapEntry[]): string => {
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
  const urlsetOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
  const urlsetClose = '</urlset>';

  const urls = entries.map(entry => `
  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastModified}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`).join('');

  return `${xmlHeader}\n${urlsetOpen}${urls}\n${urlsetClose}`;
};

// Robots.txt generation
export const generateRobotsTxt = (sitemapUrl: string, disallowPaths: string[] = []) => {
  const disallowRules = disallowPaths.map(path => `Disallow: ${path}`).join('\n');
  
  return `User-agent: *
${disallowRules || 'Allow: /'}

Sitemap: ${sitemapUrl}

# Additional crawling rules
Crawl-delay: 1

# Block AI crawlers if desired (optional)
# User-agent: ChatGPT-User
# Disallow: /
# User-agent: GPTBot
# Disallow: /`;
};

// Meta viewport and other technical SEO tags
export const generateTechnicalSEOTags = () => {
  return [
    { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
    { name: 'robots', content: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1' },
    { name: 'googlebot', content: 'index, follow' },
    { name: 'format-detection', content: 'telephone=no' },
    { name: 'theme-color', content: '#3B82F6' }, // Your brand color
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'default' }
  ];
};

// Performance-related SEO tags
export const generatePerformanceSEOTags = () => {
  return [
    // DNS prefetch for external domains
    { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
    { rel: 'dns-prefetch', href: '//fonts.gstatic.com' },
    
    // Preconnect for critical resources
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' as const },
    
    // Resource hints (these would be dynamically generated)
    // { rel: 'prefetch', href: '/api/posts' }, // Prefetch API endpoints
    // { rel: 'preload', href: '/hero-image.webp', as: 'image' }, // Preload critical images
  ];
};

// Social media sharing utilities
export const generateSocialShareURLs = (url: string, title: string, description: string) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);

  return {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`
  };
};
