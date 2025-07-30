require('dotenv').config();
const cosmosDB = require('./services/cosmosDB');
const posts = [
  {
    "title": "Advanced GitHub Copilot Prompts",
    "content": "### Advanced GitHub Copilot Prompts\n\nGitHub Copilot is changing the way developers write code. This article dives deep into advanced github copilot prompts. Discover best practices, examples, and how to get the most out of Copilot.",
    "image": "https://source.unsplash.com/featured/?ai,code",
    "author": "AI Team",
    "createdAt": "2025-07-21T19:23:28.599Z",
    "tags": ["GitHub", "Copilot", "AI", "Development"],
    "category": "AI & Copilot"
  },
  {
    "title": "Using Copilot with React and TypeScript",
    "content": "### Using Copilot with React and TypeScript\n\nExplore how GitHub Copilot speeds up frontend development using modern React and TypeScript stacks. Code smarter, not harder.",
    "image": "https://source.unsplash.com/featured/?copilot",
    "author": "AI Team",
    "createdAt": "2025-07-20T13:17:10.104Z",
    "tags": ["React", "TypeScript", "Copilot", "Frontend"],
    "category": "AI & Copilot"
  },
  {
    "title": "AI Code Review with Copilot",
    "content": "### AI Code Review with Copilot\n\nLeverage Copilot for intelligent code suggestions and reviewing patterns in your pull requests. Learn how AI helps improve code quality.",
    "image": "https://source.unsplash.com/featured/?machinelearning",
    "author": "AI Team",
    "createdAt": "2025-07-18T09:11:45.884Z",
    "tags": ["Code Review", "Copilot", "GitHub", "AI"],
    "category": "AI & Copilot"
  },
  {
    "title": "Copilot in Visual Studio vs VS Code",
    "content": "### Copilot in Visual Studio vs VS Code\n\nCompare the GitHub Copilot experience across different IDEs. Which one suits your workflow best?",
    "image": "https://source.unsplash.com/featured/?github",
    "author": "AI Team",
    "createdAt": "2025-07-15T16:40:39.509Z",
    "tags": ["Copilot", "IDE", "Visual Studio", "VS Code"],
    "category": "AI & Copilot"
  },
  {
    "title": "Pair Programming with Copilot",
    "content": "### Pair Programming with Copilot\n\nExperience a new way of pair programming with GitHub Copilot as your AI partner. Learn best strategies and where human collaboration still wins.",
    "image": "https://source.unsplash.com/featured/?developer,ai",
    "author": "AI Team",
    "createdAt": "2025-07-14T10:26:12.000Z",
    "tags": ["Pair Programming", "AI", "Copilot"],
    "category": "AI & Copilot"
  },
  {
    "title": "How Copilot Understands Your Codebase",
    "content": "### How Copilot Understands Your Codebase\n\nUnderstand the logic GitHub Copilot uses to give context-aware suggestions. Tips for maximizing Copilot’s contextual intelligence.",
    "image": "https://source.unsplash.com/featured/?ai,code",
    "author": "AI Team",
    "createdAt": "2025-07-12T08:01:39.000Z",
    "tags": ["Context Awareness", "Copilot", "Codebase"],
    "category": "AI & Copilot"
  },
  {
    "title": "Copilot for Unit Testing",
    "content": "### Copilot for Unit Testing\n\nSpeed up your unit test writing with Copilot. Learn how to prompt for test generation in React, Node.js, and more.",
    "image": "https://source.unsplash.com/featured/?unittest",
    "author": "AI Team",
    "createdAt": "2025-07-11T12:44:09.000Z",
    "tags": ["Unit Testing", "TDD", "Copilot"],
    "category": "AI & Copilot"
  },
  {
    "title": "Advanced Copilot CLI Tricks",
    "content": "### Advanced Copilot CLI Tricks\n\nExplore lesser-known CLI tricks with GitHub Copilot and speed up your workflow.",
    "image": "https://source.unsplash.com/featured/?terminal",
    "author": "AI Team",
    "createdAt": "2025-07-09T19:34:22.000Z",
    "tags": ["CLI", "Productivity", "Copilot"],
    "category": "AI & Copilot"
  },
  {
    "title": "Debugging Copilot Suggestions",
    "content": "### Debugging Copilot Suggestions\n\nUnderstand when Copilot goes wrong — and how to guide it toward better code with smarter prompts.",
    "image": "https://source.unsplash.com/featured/?debugging",
    "author": "AI Team",
    "createdAt": "2025-07-08T15:20:00.000Z",
    "tags": ["Debugging", "AI", "Copilot"],
    "category": "AI & Copilot"
  },
  {
    "title": "How to Fine-tune Prompts for Copilot",
    "content": "### How to Fine-tune Prompts for Copilot\n\nPrompt engineering isn’t just for ChatGPT. Learn how to get better code from Copilot by improving your prompts.",
    "image": "https://source.unsplash.com/featured/?prompt,engineering",
    "author": "AI Team",
    "createdAt": "2025-07-06T11:57:19.000Z",
    "tags": ["Prompt Engineering", "Copilot", "Dev Tools"],
    "category": "AI & Copilot"
  },
  {
    "title": "Copilot in Enterprise Environments",
    "content": "### Copilot in Enterprise Environments\n\nUnderstand Copilot's role in enterprise-scale development, including GitHub Copilot for Business.",
    "image": "https://source.unsplash.com/featured/?enterprise,developer",
    "author": "AI Team",
    "createdAt": "2025-07-04T14:49:00.000Z",
    "tags": ["Enterprise", "Security", "Copilot"],
    "category": "AI & Copilot"
  },
  {
    "title": "Security Considerations with Copilot",
    "content": "### Security Considerations with Copilot\n\nWhat should teams be aware of when integrating Copilot into secure workflows? Tips and risks explained.",
    "image": "https://source.unsplash.com/featured/?cybersecurity",
    "author": "AI Team",
    "createdAt": "2025-07-02T17:11:33.000Z",
    "tags": ["Security", "Best Practices", "Copilot"],
    "category": "AI & Copilot"
  },
  {
    "title": "Best Copilot Extensions for VS Code",
    "content": "### Best Copilot Extensions for VS Code\n\nEnhance your Copilot usage with these must-have VS Code extensions and themes.",
    "image": "https://source.unsplash.com/featured/?vscode",
    "author": "AI Team",
    "createdAt": "2025-06-30T13:45:02.000Z",
    "tags": ["VS Code", "Extensions", "Copilot"],
    "category": "AI & Copilot"
  },
  {
    "title": "How Copilot Learns Context",
    "content": "### How Copilot Learns Context\n\nExplore the AI behind Copilot's ability to understand file structures and project context.",
    "image": "https://source.unsplash.com/featured/?context,code",
    "author": "AI Team",
    "createdAt": "2025-06-29T10:38:17.000Z",
    "tags": ["AI", "Context", "Copilot"],
    "category": "AI & Copilot"
  },
  {
    "title": "Copilot for Documentation Generation",
    "content": "### Copilot for Documentation Generation\n\nUse GitHub Copilot to write comments, docs, and even README files. A guide to automating documentation.",
    "image": "https://source.unsplash.com/featured/?documentation",
    "author": "AI Team",
    "createdAt": "2025-06-27T08:22:41.000Z",
    "tags": ["Documentation", "Copilot", "Automation"],
    "category": "AI & Copilot"
  },
  {
    "title": "New in GitHub Copilot Labs",
    "content": "### New in GitHub Copilot Labs\n\nAn overview of experimental features in Copilot Labs. Try things before they go mainstream.",
    "image": "https://source.unsplash.com/featured/?lab,tech",
    "author": "AI Team",
    "createdAt": "2025-06-25T19:10:20.000Z",
    "tags": ["Labs", "Beta", "Copilot"],
    "category": "AI & Copilot"
  },
  {
    "title": "Using Copilot with Python Projects",
    "content": "### Using Copilot with Python Projects\n\nSee how Copilot performs in Python-heavy repositories. From automation to data science.",
    "image": "https://source.unsplash.com/featured/?python",
    "author": "AI Team",
    "createdAt": "2025-06-23T17:55:01.000Z",
    "tags": ["Python", "Copilot", "Automation"],
    "category": "AI & Copilot"
  },
  {
    "title": "GitHub Copilot X: What's New",
    "content": "### GitHub Copilot X: What's New\n\nExplore GitHub Copilot X’s chat mode, pull request help, and IDE integrations.",
    "image": "https://source.unsplash.com/featured/?copilot,x",
    "author": "AI Team",
    "createdAt": "2025-06-22T12:11:48.000Z",
    "tags": ["Copilot X", "AI", "GitHub"],
    "category": "AI & Copilot"
  },
  {
    "title": "Integrating Copilot with CI/CD",
    "content": "### Integrating Copilot with CI/CD\n\nCan Copilot assist with DevOps pipelines? Yes! Learn how to guide Copilot to write CI/CD YAMLs and scripts.",
    "image": "https://source.unsplash.com/featured/?devops",
    "author": "AI Team",
    "createdAt": "2025-06-20T09:39:22.000Z",
    "tags": ["DevOps", "CI/CD", "Copilot"],
    "category": "AI & Copilot"
  },
  {
    "title": "How Copilot Impacts Developer Productivity",
    "content": "### How Copilot Impacts Developer Productivity\n\nReal-world data and insights on how developers are using Copilot to boost velocity and reduce burnout.",
    "image": "https://source.unsplash.com/featured/?productivity,ai",
    "author": "AI Team",
    "createdAt": "2025-06-18T15:30:10.000Z",
    "tags": ["Productivity", "Developer Experience", "Copilot"],
    "category": "AI & Copilot"
  }
];


async function seedCopilotPosts() {
  try {
    console.log('🌱 Starting to seed Copilot posts...');
    
    // Connect to database
    await cosmosDB.connect();
    console.log('✅ Connected to Cosmos DB');

    let successCount = 0;
    let errorCount = 0;

    for (const postData of posts) {
      try {
        // Generate slug from title
        const slug = postData.title
          .toLowerCase()
          .replace(/[^a-z0-9 -]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim('-');

        // Create excerpt from content (first 200 characters)
        const excerpt = postData.content
          .replace(/#{1,6}\s/g, '') // Remove markdown headers
          .replace(/\n/g, ' ')      // Replace newlines with spaces
          .substring(0, 200) + '...';

        const postToCreate = {
          ...postData,
          slug: slug,
          excerpt: excerpt,
          status: 'published',
          featuredImage: postData.image,
          views: Math.floor(Math.random() * 100) + 10, // Random views between 10-110
          likes: Math.floor(Math.random() * 50) + 5,   // Random likes between 5-55
          updatedAt: postData.createdAt
        };

        // Remove the image field as we're using featuredImage
        delete postToCreate.image;

        const createdPost = await cosmosDB.createPost(postToCreate);
        console.log(`✅ Created post: "${postData.title}"`);
        successCount++;
        
        // Small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Error creating post "${postData.title}":`, error.message);
        errorCount++;
      }
    }

    console.log('\n🎉 Seeding completed!');
    console.log(`✅ Successfully created: ${successCount} posts`);
    if (errorCount > 0) {
      console.log(`❌ Failed to create: ${errorCount} posts`);
    }
    
  } catch (error) {
    console.error('💥 Fatal error during seeding:', error);
  }
}

// Run the seeding function
seedCopilotPosts()
  .then(() => {
    console.log('🏁 Seeding process finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  });
