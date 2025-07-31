import React from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  generateStructuredData, 
  generateOpenGraphTags, 
  generateTwitterTags, 
  generateLinkTags,
  generateTechnicalSEOTags,
  generatePerformanceSEOTags,
  type SEOData,
  type BlogPostSEO 
} from '../../utils/seo';

interface EnhancedSEOHeadProps {
  data: SEOData | BlogPostSEO;
  children?: React.ReactNode;
}

const EnhancedSEOHead: React.FC<EnhancedSEOHeadProps> = ({ data, children }) => {
  const structuredData = generateStructuredData(data);
  const openGraphTags = generateOpenGraphTags(data);
  const twitterTags = generateTwitterTags(data);
  const linkTags = generateLinkTags(data);
  const technicalTags = generateTechnicalSEOTags();
  const performanceTags = generatePerformanceSEOTags();

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{data.title}</title>
      <meta name="description" content={data.description} />
      {data.keywords && <meta name="keywords" content={data.keywords.join(', ')} />}
      {data.author && <meta name="author" content={data.author} />}

      {/* Technical SEO Tags */}
      {technicalTags.map((tag, index) => (
        <meta key={`technical-${index}`} {...tag} />
      ))}

      {/* Open Graph Tags */}
      {openGraphTags.map((tag, index) => (
        <meta key={`og-${index}`} {...tag} />
      ))}

      {/* Twitter Tags */}
      {twitterTags.map((tag, index) => (
        <meta key={`twitter-${index}`} {...tag} />
      ))}

      {/* Link Tags */}
      {linkTags.map((tag, index) => (
        <link key={`link-${index}`} {...tag} />
      ))}

      {/* Performance SEO Tags */}
      {performanceTags.map((tag, index) => (
        <link key={`perf-${index}`} {...tag} />
      ))}

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>

      {/* Article-specific tags */}
      {data.type === 'article' && (
        <>
          <meta property="article:published_time" content={(data as BlogPostSEO).publishedTime} />
          <meta property="article:author" content={(data as BlogPostSEO).author} />
          {(data as BlogPostSEO).modifiedTime && (
            <meta property="article:modified_time" content={(data as BlogPostSEO).modifiedTime} />
          )}
          {(data as BlogPostSEO).tags?.map((tag, index) => (
            <meta key={`article-tag-${index}`} property="article:tag" content={tag} />
          ))}
          {(data as BlogPostSEO).category && (
            <meta property="article:section" content={(data as BlogPostSEO).category} />
          )}
        </>
      )}

      {/* Custom children for page-specific meta tags */}
      {children}
    </Helmet>
  );
};

export default EnhancedSEOHead;
