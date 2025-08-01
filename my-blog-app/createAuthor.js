const axios = require('axios');

// Create author profile for Sumit Malik
async function createAuthorProfile() {
  try {
    const authorData = {
      name: "Sumit Malik",
      bio: "Full-stack developer and technical writer passionate about cloud technologies, modern web development, and sharing knowledge through comprehensive tutorials. With extensive experience in Azure, Node.js, React, and DevOps practices, I love helping developers build scalable applications.",
      avatar: "https://avatars.githubusercontent.com/u/sumitmalik51?v=4",
      jobTitle: "Senior Full Stack Developer",
      company: "Tech Innovator",
      location: "India",
      website: "https://sumitmalik.dev",
      socialLinks: {
        github: "https://github.com/sumitmalik51",
        linkedin: "https://linkedin.com/in/sumitmalik51",
        twitter: "https://twitter.com/sumitmalik51",
        email: "sumit@sumitmalik.dev"
      },
      expertise: [
        "Full Stack Development",
        "Azure Cloud",
        "React & Node.js",
        "DevOps & CI/CD",
        "Technical Writing",
        "System Architecture"
      ]
    };

    console.log('Creating author profile...');
    const response = await axios.post('http://localhost:5000/api/authors', authorData);
    console.log('Author created successfully:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error creating author:', error.response?.data || error.message);
    throw error;
  }
}

// Update existing posts to include author
async function updatePostsWithAuthor(authorSlug) {
  try {
    console.log('Fetching existing posts...');
    const postsResponse = await axios.get('http://localhost:5000/api/posts?limit=100');
    const posts = postsResponse.data.posts;

    console.log(`Found ${posts.length} posts to update...`);
    
    for (const post of posts) {
      try {
        const updateData = {
          ...post,
          authorSlug: authorSlug
        };
        
        await axios.put(`http://localhost:5000/api/posts/${post.id}`, updateData);
        console.log(`Updated post: ${post.title}`);
      } catch (error) {
        console.error(`Failed to update post ${post.title}:`, error.response?.data || error.message);
      }
    }
    
    console.log('Finished updating posts with author information');
  } catch (error) {
    console.error('Error updating posts:', error.response?.data || error.message);
  }
}

async function main() {
  try {
    // Create author profile
    const author = await createAuthorProfile();
    
    // Update existing posts with author
    await updatePostsWithAuthor(author.slug);
    
    console.log('\n✅ Author system setup complete!');
    console.log(`Author profile: ${author.name} (${author.slug})`);
    console.log(`Profile URL: http://localhost:3000/authors/${author.slug}`);
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

main();
