
import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// Get all success stories
export async function GET() {
  try {
    const stories = await sql`
      SELECT * FROM success_stories ORDER BY created_at DESC
    `;
    return NextResponse.json(stories);
  } catch (error) {
    console.error('Failed to fetch stories:', error);
    return NextResponse.json({ message: 'Failed to fetch stories' }, { status: 500 });
  }
}

// Create a new success story
export async function POST(request: Request) {
  try {
    const { title, summary, body, featured_image_url, video_url, quote, category, year, is_featured, status, published_at } = await request.json();

    if (!title || !summary || !body) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    await sql`
      INSERT INTO success_stories (title, summary, body, featured_image_url, video_url, quote, category, year, is_featured, status, published_at)
      VALUES (${title}, ${summary}, ${body}, ${featured_image_url}, ${video_url}, ${quote}, ${category}, ${year}, ${is_featured}, ${status}, ${published_at})
    `;

    return NextResponse.json({ message: 'Success story created' }, { status: 201 });
  } catch (error) {
    console.error('Failed to create story:', error);
    return NextResponse.json({ message: 'Failed to create story' }, { status: 500 });
  }
}
