require('dotenv').config();
const cosmosDB = require('./services/cosmosDB');

const samplePosts = [
  {
    title: "Getting Started with Azure Cosmos DB",
    slug: "getting-started-azure-cosmos-db",
    content: "Azure Cosmos DB is Microsoft's globally distributed, multi-model database service. In this comprehensive guide, we'll explore how to get started with Cosmos DB and build scalable applications.\n\n## What is Azure Cosmos DB?\n\nAzure Cosmos DB is a fully managed NoSQL database service that provides fast and predictable performance, seamless global distribution, and elastic scaling.\n\n## Key Features\n\n- **Global Distribution**: Distribute your data across any number of Azure regions\n- **Multi-Model Support**: Support for document, key-value, graph, and column-family data models\n- **Elastic Scale**: Scale throughput and storage independently\n- **Low Latency**: Single-digit millisecond latencies at the 99th percentile\n\n## Getting Started\n\n1. Create an Azure Cosmos DB account\n2. Choose your API (SQL, MongoDB, Cassandra, etc.)\n3. Create a database and container\n4. Start building your application\n\nThis tutorial will walk you through each step in detail.",
    excerpt: "Learn how to get started with Azure Cosmos DB, Microsoft's globally distributed NoSQL database service.",
    author: "CloudManual Team",
    status: "published",
    tags: ["Azure", "Database", "NoSQL", "Cosmos DB"],
    views: 245,
    metaTitle: "Getting Started with Azure Cosmos DB - Complete Guide",
    metaDescription: "Complete guide to getting started with Azure Cosmos DB. Learn about features, setup, and best practices.",
    featuredImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
  },
  {
    title: "Docker Best Practices for Production",
    slug: "docker-best-practices-production",
    content: "Running Docker containers in production requires careful consideration of security, performance, and reliability. Here are the essential best practices.\n\n## Security Best Practices\n\n### Use Minimal Base Images\nStart with minimal base images like Alpine Linux to reduce attack surface:\n\n```dockerfile\nFROM node:18-alpine\n```\n\n### Run as Non-Root User\nAlways run your applications as a non-root user:\n\n```dockerfile\nRUN addgroup -g 1001 -S nodejs\nRUN adduser -S nextjs -u 1001\nUSER nextjs\n```\n\n### Use Multi-Stage Builds\nReduce image size and improve security with multi-stage builds:\n\n```dockerfile\n# Build stage\nFROM node:18-alpine AS builder\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --only=production\n\n# Production stage\nFROM node:18-alpine AS production\nWORKDIR /app\nCOPY --from=builder /app/node_modules ./node_modules\nCOPY . .\nEXPOSE 3000\nCMD [\"npm\", \"start\"]\n```\n\n## Performance Optimization\n\n- Use .dockerignore to exclude unnecessary files\n- Optimize layer caching\n- Set appropriate resource limits\n- Use health checks\n\n## Monitoring and Logging\n\nImplement proper logging and monitoring strategies for production deployments.",
    excerpt: "Essential Docker best practices for secure and efficient production deployments.",
    author: "DevOps Expert",
    status: "published",
    tags: ["Docker", "DevOps", "Security", "Best Practices"],
    views: 512,
    metaTitle: "Docker Best Practices for Production - Security & Performance",
    metaDescription: "Learn essential Docker best practices for production deployments including security, performance, and monitoring.",
    featuredImage: "https://images.unsplash.com/photo-1605745341112-85968b19335b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
  },
  {
    title: "Kubernetes Deployment Strategies Explained",
    slug: "kubernetes-deployment-strategies",
    content: "Understanding different deployment strategies in Kubernetes is crucial for maintaining application availability and ensuring smooth updates.\n\n## Rolling Updates\n\nThe default deployment strategy that gradually replaces old pods with new ones:\n\n```yaml\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: my-app\nspec:\n  replicas: 3\n  strategy:\n    type: RollingUpdate\n    rollingUpdate:\n      maxUnavailable: 1\n      maxSurge: 1\n  template:\n    spec:\n      containers:\n      - name: app\n        image: my-app:v2\n```\n\n## Blue-Green Deployments\n\nMaintain two identical production environments:\n\n1. **Blue**: Current live environment\n2. **Green**: New version for testing\n\nSwitch traffic instantly between environments.\n\n## Canary Deployments\n\nGradually roll out changes to a subset of users:\n\n```yaml\napiVersion: argoproj.io/v1alpha1\nkind: Rollout\nmetadata:\n  name: canary-rollout\nspec:\n  replicas: 10\n  strategy:\n    canary:\n      steps:\n      - setWeight: 10\n      - pause: {}\n      - setWeight: 50\n      - pause: {duration: 10s}\n      - setWeight: 100\n```\n\n## A/B Testing\n\nRoute traffic based on specific criteria to test different versions simultaneously.\n\n## Choosing the Right Strategy\n\n- **Rolling Updates**: Default choice for most applications\n- **Blue-Green**: When you need instant rollback capability\n- **Canary**: For gradual rollouts with monitoring\n- **A/B Testing**: For feature testing and optimization",
    excerpt: "Learn different Kubernetes deployment strategies including rolling updates, blue-green, and canary deployments.",
    author: "K8s Expert",
    status: "published",
    tags: ["Kubernetes", "DevOps", "Deployment", "CI/CD"],
    views: 387,
    metaTitle: "Kubernetes Deployment Strategies - Rolling, Blue-Green, Canary",
    metaDescription: "Complete guide to Kubernetes deployment strategies including rolling updates, blue-green deployments, and canary releases.",
    featuredImage: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
  },
  {
    title: "AI and Machine Learning in the Cloud",
    slug: "ai-machine-learning-cloud",
    content: "Cloud platforms have revolutionized AI and machine learning by providing scalable infrastructure and managed services.\n\n## Cloud AI Services\n\n### Azure Cognitive Services\n- **Computer Vision**: Image analysis and recognition\n- **Speech Services**: Speech-to-text and text-to-speech\n- **Language Understanding**: Natural language processing\n- **Decision Services**: Recommendation engines\n\n### AWS AI Services\n- **Amazon SageMaker**: End-to-end ML platform\n- **Amazon Rekognition**: Image and video analysis\n- **Amazon Comprehend**: Natural language processing\n- **Amazon Lex**: Conversational AI\n\n### Google Cloud AI\n- **Vertex AI**: Unified ML platform\n- **Vision AI**: Image understanding\n- **Natural Language AI**: Text analysis\n- **AutoML**: Automated machine learning\n\n## Benefits of Cloud AI\n\n### Scalability\nCloud platforms provide virtually unlimited compute resources for training and inference.\n\n### Cost Efficiency\nPay-as-you-use pricing models reduce upfront costs.\n\n### Managed Services\nFocus on your application logic while the cloud provider manages infrastructure.\n\n### Global Reach\nDeploy AI models globally with low latency.\n\n## Getting Started\n\n1. **Choose Your Platform**: Select based on your existing cloud infrastructure\n2. **Start Small**: Begin with pre-built AI services\n3. **Experiment**: Use notebooks and managed environments\n4. **Scale Gradually**: Move to custom models as needed\n\n## Best Practices\n\n- **Data Privacy**: Ensure compliance with regulations\n- **Model Versioning**: Track model iterations\n- **Monitoring**: Implement model performance monitoring\n- **Cost Management**: Monitor and optimize costs",
    excerpt: "Explore how cloud platforms are transforming AI and machine learning with scalable infrastructure and managed services.",
    author: "AI Researcher",
    status: "published",
    tags: ["AI", "Machine Learning", "Cloud", "Azure", "AWS"],
    views: 642,
    metaTitle: "AI and Machine Learning in the Cloud - Complete Guide",
    metaDescription: "Learn how to leverage cloud platforms for AI and machine learning projects with managed services and scalable infrastructure.",
    featuredImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
  },
  {
    title: "Test Post from API",
    slug: "test-post-from-api",
    content: "This is a test post created to verify that our API endpoints are working correctly.\n\n## Testing the API\n\nThis post serves as a test case for:\n\n- Creating posts via API\n- Retrieving posts by slug\n- Displaying content properly\n- Verifying all fields are working\n\n## Content Verification\n\nAll the essential fields should be present:\n- Title ✓\n- Content ✓\n- Excerpt ✓\n- Author ✓\n- Tags ✓\n- Publication status ✓\n\nIf you can see this post, then the API is working correctly!",
    excerpt: "A test post to verify that all API endpoints are functioning correctly.",
    author: "API Tester",
    status: "published",
    tags: ["Testing", "API", "Development"],
    views: 0,
    metaTitle: "Test Post from API",
    metaDescription: "Test post to verify API functionality",
    featuredImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
  }
];

async function seedPosts() {
  try {
    console.log('Connecting to Azure Cosmos DB...');
    await cosmosDB.connect();
    
    console.log('Seeding sample posts...');
    
    for (const postData of samplePosts) {
      try {
        // Check if post already exists
        const existingPost = await cosmosDB.getPostBySlug(postData.slug);
        
        if (existingPost) {
          console.log(`Post "${postData.title}" already exists, skipping...`);
          continue;
        }
        
        // Create the post
        const post = await cosmosDB.createPost(postData);
        console.log(`✓ Created post: "${post.title}" with slug: "${post.slug}"`);
        
      } catch (error) {
        console.error(`Error creating post "${postData.title}":`, error.message);
      }
    }
    
    console.log('\n✅ Sample posts seeded successfully!');
    console.log('\nYou can now test the API with these slugs:');
    samplePosts.forEach(post => {
      console.log(`- http://localhost:5000/api/posts/${post.slug}`);
    });
    
  } catch (error) {
    console.error('Error seeding posts:', error);
  }
}

// Run the seeder
if (require.main === module) {
  seedPosts().then(() => {
    console.log('Seeding completed.');
    process.exit(0);
  }).catch(error => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
}

module.exports = { samplePosts, seedPosts };
