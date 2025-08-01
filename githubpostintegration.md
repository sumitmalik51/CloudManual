Goal: Use GitHub to manage blog content (instead of a rich editor)
You create blog posts as Markdown files (.md) in a GitHub repo.

On commit or push, your app automatically:

Parses the Markdown.

Saves the post into Cosmos DB.

Triggers a rebuild or shows it live in your app.

🧠 Why this is a great solution:
You bypass the need for TinyMCE or paid editors.

GitHub becomes your CMS.

You can version control and preview content.

Ideal for developer-focused blogs like yours.

🔧 Implementation Overview
1. Create a posts/ folder in your GitHub repo
Each .md file is a blog post. Example structure:

bash
Copy
Edit
/posts
  post-1.md
  post-2.md
Each file has YAML frontmatter for metadata:

md
Copy
Edit
---
title: "Deploying Azure Functions with GitHub Actions"
slug: "azure-functions-github-actions"
author: "Sumit Malik"
excerpt: "Learn how to CI/CD Azure Functions using GitHub Actions."
tags: ["Azure", "CI/CD"]
featuredImage: "/images/azure-ci.png"
createdAt: "2025-07-31"
---

## Introduction

In this tutorial, you'll learn how to deploy...
2. Write a GitHub Webhook → /api/github-webhook.ts
ts
Copy
Edit
// /pages/api/github-webhook.ts
import { NextApiRequest, NextApiResponse } from 'next';
import matter from 'gray-matter';
import { CosmosClient } from '@azure/cosmos';
import axios from 'axios';

const cosmos = new CosmosClient({
  endpoint: process.env.COSMOS_ENDPOINT!,
  key: process.env.COSMOS_KEY!,
});
const container = cosmos
  .database('cloudmanual-blog')
  .container('posts');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method not allowed');

  try {
    const { head_commit } = req.body;

    // List modified files
    const changedFiles = head_commit.modified.concat(head_commit.added);
    const postFiles = changedFiles.filter(f => f.startsWith('posts/') && f.endsWith('.md'));

    for (const filePath of postFiles) {
      const url = `https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/${head_commit.id}/${filePath}`;
      const mdRes = await axios.get(url);

      const parsed = matter(mdRes.data);
      const content = parsed.content;
      const metadata = parsed.data;

      await container.items.upsert({
        id: metadata.slug,
        type: 'post',
        ...metadata,
        content,
        updatedAt: new Date().toISOString(),
      });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}
3. Add GitHub Webhook
In your GitHub repo:

Go to Settings → Webhooks → Add webhook

Payload URL: https://yourdomain.com/api/github-webhook

Content type: application/json

Events: Push events

Secret: Optional

4. Update your frontend to use Cosmos data (which you're already doing!)
You're done. GitHub is now your editor. 🎉

➕ Optional Enhancements
Add build preview support using next-mdx-remote.

Use GitHub Issues as suggestions → Markdown → Publish.

Add custom GitHub Action to publish only on PR merge.

