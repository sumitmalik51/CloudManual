export const homeData = {
  // Topics data for modal
  topicsData: [
    {
      name: 'Cloud Architecture',
      count: 25,
      color: 'from-blue-500 to-cyan-500',
      description: 'Azure, AWS, and multi-cloud architecture patterns and best practices'
    },
    {
      name: 'DevOps & CI/CD',
      count: 20,
      color: 'from-green-500 to-emerald-500',
      description: 'Automation, deployment pipelines, and infrastructure as code'
    },
    {
      name: 'AI & Machine Learning',
      count: 20,
      color: 'from-purple-500 to-pink-500',
      description: 'AI implementation, ML models, and intelligent automation'
    },
    {
      name: 'Containerization',
      count: 20,
      color: 'from-orange-500 to-red-500',
      description: 'Docker, Kubernetes, and container orchestration'
    },
    {
      name: 'Development Tools',
      count: 15,
      color: 'from-indigo-500 to-purple-500',
      description: 'IDEs, frameworks, and productivity tools for developers'
    }
  ],

  // Sample search suggestions
  popularSearches: [
    'GitHub Copilot tutorial',
    'Azure container apps',
    'Docker best practices',
    'Kubernetes deployment',
    'AI model implementation',
    'DevOps automation',
    'TypeScript performance',
    'Cloud architecture patterns'
  ],

  // Categories
  categories: ['All', 'Cloud', 'DevOps', 'AI', 'Security', 'WebDev'],

  // Recent updates data
  recentUpdates: [
    {
      icon: '🚀',
      title: 'New Azure Container Apps Guide',
      description: 'Complete walkthrough of deploying microservices with Azure Container Apps',
      date: 'Jan 15',
      type: 'Tutorial',
      badge: 'NEW'
    },
    {
      icon: '🤖',
      title: 'GitHub Copilot Best Practices',
      description: 'Advanced tips and tricks for maximizing productivity with AI pair programming',
      date: 'Jan 12',
      type: 'Guide',
      badge: 'UPDATED'
    },
    {
      icon: '⚡',
      title: 'Performance Optimization Series',
      description: 'Deep dive into React performance patterns and optimization techniques',
      date: 'Jan 10',
      type: 'Series',
      badge: 'SERIES'
    },
    {
      icon: '🔒',
      title: 'Zero Trust Security Model',
      description: 'Implementation guide for modern security architecture in cloud environments',
      date: 'Jan 8',
      type: 'Security',
      badge: 'FEATURE'
    },
    {
      icon: '📊',
      title: 'DevOps Metrics Dashboard',
      description: 'Building comprehensive monitoring and observability for your applications',
      date: 'Jan 5',
      type: 'DevOps',
      badge: 'IMPROVED'
    }
  ],

  // Testimonials data
  testimonials: [
    {
      quote: "CloudManual has been instrumental in our team's cloud adoption journey. The practical guides and real-world examples saved us months of trial and error.",
      author: "Sarah Chen",
      role: "Senior DevOps Engineer",
      company: "TechCorp Inc.",
      avatar: "SC"
    },
    {
      quote: "The AI integration tutorials are top-notch. I was able to implement GitHub Copilot across our development team using their comprehensive guides.",
      author: "Marcus Rodriguez",
      role: "Tech Lead",
      company: "InnovateLabs",
      avatar: "MR"
    },
    {
      quote: "Finally, a resource that explains complex cloud concepts in an accessible way. The step-by-step tutorials are exactly what our junior developers needed.",
      author: "Emily Watson",
      role: "Engineering Manager",
      company: "StartupXYZ",
      avatar: "EW"
    }
  ]
};

export const getStatsData = (stats: any) => [
  { 
    label: 'Published Articles', 
    value: stats.totalPosts.toString(), 
    icon: '📚', 
    color: 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' 
  },
  { 
    label: 'Monthly Readers', 
    value: (stats.totalReaders / 1000).toFixed(1) + 'K', 
    icon: '👥', 
    color: 'bg-gradient-to-br from-green-500 to-green-600 text-white' 
  },
  { 
    label: 'Page Views', 
    value: (stats.totalViews / 1000).toFixed(0) + 'K', 
    icon: '📈', 
    color: 'bg-gradient-to-br from-purple-500 to-purple-600 text-white' 
  },
  { 
    label: 'Topics Covered', 
    value: stats.categories.toString(), 
    icon: '🎯', 
    color: 'bg-gradient-to-br from-orange-500 to-orange-600 text-white' 
  }
];
