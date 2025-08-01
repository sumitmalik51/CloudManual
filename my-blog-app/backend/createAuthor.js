const axios = require('axios');

// Create author profile for Sumit Malik
async function createAuthorProfile() {
  try {
    const authorData = {
      name: "Sumit Malik",
      email: "sumitmalik51@gmail.com",
      bio: "Cloud Solution Architect with deep expertise in designing scalable cloud infrastructures and implementing AI solutions. Passionate about helping organizations modernize their technology stack and leverage AI for business transformation.",
      avatar: "https://github.com/sumitmalik51.png",
      jobTitle: "Cloud Solution Architect & AI Specialist",
      company: "CloudManual",
      location: "Remote / Global",
      website: "https://cloudmanual.dev",
      socialLinks: {
        github: "https://github.com/sumitmalik51",
        linkedin: "https://www.linkedin.com/in/sumitmalik51/",
        instagram: "https://www.instagram.com/sumitmalik._",
        email: "sumitmalik51@gmail.com"
      },
      expertise: [
        "Azure Architecture",
        "AI & Machine Learning", 
        "Cloud Strategy",
        "Solution Design",
        "Digital Transformation"
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
