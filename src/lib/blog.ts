import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'src/content/posts');

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  description: string;
  content: string;
  tags?: string[];
  series?: string;
  coverColor?: string;
  readingTime: number; // minutes
}

export type BlogPostMeta = Omit<BlogPost, 'content'>;

function estimateReadingTime(content: string): number {
  const cjkChars = (content.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) || []).length;
  const words = content.replace(/[\u4e00-\u9fff\u3400-\u4dbf]/g, '').split(/\s+/).filter(Boolean).length;
  // ~500 CJK chars/min, ~250 English words/min
  const minutes = cjkChars / 500 + words / 250;
  return Math.max(1, Math.round(minutes));
}

export function getPostMetadata(): BlogPostMeta[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);

  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const matterResult = matter(fileContents);

      return {
        slug,
        title: matterResult.data.title,
        date: matterResult.data.date,
        description: matterResult.data.description,
        tags: matterResult.data.tags || [],
        series: matterResult.data.series,
        coverColor: matterResult.data.coverColor,
        readingTime: estimateReadingTime(matterResult.content),
      };
    });

  return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostContent(slug: string): BlogPost | null {
  const fullPath = path.join(postsDirectory, `${slug}.md`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const matterResult = matter(fileContents);

  return {
    slug,
    title: matterResult.data.title,
    date: matterResult.data.date,
    description: matterResult.data.description,
    tags: matterResult.data.tags || [],
    series: matterResult.data.series,
    coverColor: matterResult.data.coverColor,
    readingTime: estimateReadingTime(matterResult.content),
    content: matterResult.content,
  };
}

export function getAllTags(): string[] {
  const posts = getPostMetadata();
  const tagSet = new Set<string>();
  posts.forEach((p) => p.tags?.forEach((t) => tagSet.add(t)));
  return Array.from(tagSet).sort();
}

export function getSeriesPosts(series: string): BlogPostMeta[] {
  return getPostMetadata().filter((p) => p.series === series);
}
