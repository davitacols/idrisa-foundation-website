
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

async function getStories() {
  try {
    const stories = await sql`
      SELECT * FROM success_stories WHERE status = 'published' ORDER BY created_at DESC
    `;
    return stories;
  } catch (error) {
    console.error('Failed to fetch stories:', error);
    // In a real application, you'd want to handle this more gracefully.
    // For now, we'll return an empty array to prevent the page from crashing.
    return [];
  }
}

export default async function SuccessStoriesPage() {
  const stories = await getStories();

  return (
    <div className="container mx-auto py-12 px-4">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Success Stories
        </h1>
        <p className="mt-3 text-xl text-gray-500 sm:mt-4">
          Real stories of students, scholars, mentors, and community beneficiaries.
        </p>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {stories.length > 0 ? (
          stories.map((story: any) => (
            <Card key={story.id}>
              <CardHeader>
                <CardTitle>{story.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{story.summary}</p>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full text-center py-16 px-6">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-gray-700">Coming Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-gray-500">
                Success stories will be shared here as our programs grow and lives are impacted.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
