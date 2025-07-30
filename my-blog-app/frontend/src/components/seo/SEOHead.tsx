import React, { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'CloudManual - Your Guide to Cloud Technologies',
  description = 'Comprehensive guides, tutorials, and best practices for cloud computing, Azure, AWS, DevOps, and modern web development.',
  keywords = ['cloud computing', 'Azure', 'AWS', 'DevOps', 'tutorials', 'web development'],
  image = '/og-image.jpg',
  url = typeof window !== 'undefined' ? window.location.href : '',
  type = 'website',
  author = 'CloudManual Team',
  publishedTime,
  modifiedTime,
  tags = []
}) => {
  const siteUrl = 'https://cloudmanual.com'; // Update with your actual domain
  const fullImageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;
  
  useEffect(() => {
    // Set document title
    document.title = title;
    
    // Helper function to set or update meta tags
    const setMetaTag = (name: string, content: string, property = false) => {
      if (!content) return; // Don't create empty meta tags
      
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let element = document.querySelector(selector) as HTMLMetaElement;
      
      if (element) {
        element.content = content;
      } else {
        element = document.createElement('meta');
        if (property) {
          element.setAttribute('property', name);
        } else {
          element.setAttribute('name', name);
        }
        element.content = content;
        document.head.appendChild(element);
      }
    };

    // Set basic meta tags
    setMetaTag('description', description);
    setMetaTag('keywords', keywords.join(', '));
    setMetaTag('author', author);
    setMetaTag('robots', 'index, follow');

    // Set Open Graph tags
    setMetaTag('og:type', type, true);
    setMetaTag('og:url', url, true);
    setMetaTag('og:title', title, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:image', fullImageUrl, true);
    setMetaTag('og:site_name', 'CloudManual', true);

    // Set Twitter Card tags
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:url', url);
    setMetaTag('twitter:title', title);
    setMetaTag('twitter:description', description);
    setMetaTag('twitter:image', fullImageUrl);
    setMetaTag('twitter:creator', '@cloudmanual');

    // Article specific meta tags
    if (type === 'article') {
      setMetaTag('article:author', author, true);
      if (publishedTime) setMetaTag('article:published_time', publishedTime, true);
      if (modifiedTime) setMetaTag('article:modified_time', modifiedTime, true);
      
      // Remove existing article tags first
      document.querySelectorAll('meta[property^="article:tag"]').forEach(el => el.remove());
      
      // Add new tags
      tags.forEach(tag => {
        if (tag) {
          const element = document.createElement('meta');
          element.setAttribute('property', 'article:tag');
          element.content = tag;
          document.head.appendChild(element);
        }
      });
    }

    // Set canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (canonicalLink) {
      canonicalLink.href = url;
    } else {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      canonicalLink.href = url;
      document.head.appendChild(canonicalLink);
    }

    // Add structured data for articles
    if (type === 'article' && publishedTime) {
      // Remove existing structured data
      document.querySelectorAll('script[type="application/ld+json"]').forEach(el => el.remove());
      
      const structuredDataScript = document.createElement('script') as HTMLScriptElement;
      structuredDataScript.type = 'application/ld+json';
      structuredDataScript.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": title,
        "description": description,
        "image": fullImageUrl,
        "author": {
          "@type": "Person",
          "name": author
        },
        "publisher": {
          "@type": "Organization",
          "name": "CloudManual",
          "logo": {
            "@type": "ImageObject",
            "url": `${siteUrl}/logo.png`
          }
        },
        "datePublished": publishedTime,
        "dateModified": modifiedTime || publishedTime,
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": url
        }
      });
      document.head.appendChild(structuredDataScript);
    }

    // Debug log
    console.log('SEO Head updated:', { title, description, type, url });
    
  }, [title, description, keywords, image, url, type, author, publishedTime, modifiedTime, tags, fullImageUrl, siteUrl]);

  return null; // This component doesn't render anything
};

export default SEOHead;
