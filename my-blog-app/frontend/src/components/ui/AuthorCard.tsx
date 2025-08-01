import React from 'react';
import { Link } from 'react-router-dom';
import LazyImage from './LazyImage';
import { format } from 'date-fns';

interface AuthorCardProps {
  author: {
    name: string;
    slug: string;
    bio: string;
    avatar?: string;
    jobTitle?: string;
    company?: string;
    socialLinks?: {
      twitter?: string;
      linkedin?: string;
      github?: string;
      website?: string;
    };
  };
  postDate?: string;
  size?: 'small' | 'medium' | 'large';
  showBio?: boolean;
  showSocial?: boolean;
}

const AuthorCard: React.FC<AuthorCardProps> = ({ 
  author, 
  postDate, 
  size = 'medium', 
  showBio = false,
  showSocial = false 
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          container: 'flex items-center space-x-3',
          avatar: 'w-10 h-10',
          name: 'text-sm font-semibold',
          meta: 'text-xs',
          bio: 'text-xs mt-1'
        };
      case 'large':
        return {
          container: 'flex flex-col space-y-4',
          avatar: 'w-20 h-20 mx-auto',
          name: 'text-xl font-bold text-center',
          meta: 'text-sm text-center',
          bio: 'text-sm mt-3'
        };
      default: // medium
        return {
          container: 'flex items-start space-x-4',
          avatar: 'w-14 h-14',
          name: 'text-base font-semibold',
          meta: 'text-sm',
          bio: 'text-sm mt-2'
        };
    }
  };

  const classes = getSizeClasses();

  const getSocialIcon = (platform: string) => {
    const icons = {
      twitter: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      ),
      linkedin: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
      github: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      ),
      website: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9" />
        </svg>
      )
    };
    return icons[platform as keyof typeof icons] || null;
  };

  return (
    <div className={classes.container}>
      <Link to={`/authors/${author.slug}`} className="flex-shrink-0">
        <LazyImage
          src={author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(author.name)}&background=3b82f6&color=ffffff`}
          alt={author.name}
          className={`${classes.avatar} rounded-full object-cover border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 transition-colors`}
        />
      </Link>
      
      <div className={size === 'large' ? 'text-center' : 'flex-1 min-w-0'}>
        <div className="flex flex-col">
          <Link 
            to={`/authors/${author.slug}`}
            className={`${classes.name} text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors`}
          >
            {author.name}
          </Link>
          
          <div className={`${classes.meta} text-gray-600 dark:text-gray-400 space-y-1`}>
            {author.jobTitle && author.company && (
              <div>{author.jobTitle} at {author.company}</div>
            )}
            {author.jobTitle && !author.company && (
              <div>{author.jobTitle}</div>
            )}
            {postDate && (
              <div>
                {format(new Date(postDate), 'MMM d, yyyy')}
              </div>
            )}
          </div>

          {showBio && author.bio && (
            <p className={`${classes.bio} text-gray-700 dark:text-gray-300 leading-relaxed`}>
              {author.bio.length > 120 ? `${author.bio.substring(0, 120)}...` : author.bio}
            </p>
          )}

          {showSocial && author.socialLinks && (
            <div className="flex items-center gap-2 mt-2">
              {Object.entries(author.socialLinks).map(([platform, url]) => 
                url ? (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {getSocialIcon(platform)}
                  </a>
                ) : null
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthorCard;
