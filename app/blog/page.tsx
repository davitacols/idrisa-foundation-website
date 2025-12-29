"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Mail, Share2 } from "lucide-react"

// Types
type Post = {
    id: string;
    title: string;
    author: string;
    published_at: string;
    excerpt: string;
    category_name: string;
    tags: string[];
};

// Mock Data
const samplePosts: Post[] = [
    { id: '1', title: 'Idrisa Foundation Launches 2026 STEM Olympiad Pilot in Central Uganda', author: 'Program Lead, Idrisa Foundation', published_at: '2026-02-12', excerpt: 'Idrisa Foundation is launching a national pilot of its STEM Olympiad with 12 partner schools...', category_name: 'Press Releases', tags: ['STEM', 'Olympiad', 'Program Updates'] },
    { id: '2', title: 'From Kitovu to Code: How a Scholarship Helped Aisha Build a Robotics Project', author: 'Communications Officer', published_at: '2026-03-05', excerpt: 'Aisha, a scholarship recipient, used a mentorship grant to build an affordable soil-moisture sensor for smallholder farmers.', category_name: 'Student Stories', tags: ['Scholarships', 'Mentorship'] },
    { id: '3', title: 'Summary: Open Textbooks and STEM Performance — What We Learned from OpenStax Adoption', author: 'Research Team', published_at: '2026-01-18', excerpt: 'Early evidence suggests using free, peer-reviewed open textbooks reduces course costs and improves resource access for rural students.', category_name: 'Research Summaries', tags: ['Education Policy', 'STEM'] },
];


export default function BlogPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                // In a real app, you would fetch from /api/blog
                // For now, we simulate a fetch with mock data
                await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
                setPosts(samplePosts);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    return (
        <div className="bg-white">
             <header className="bg-gray-50 border-b">
                <div className="container mx-auto px-4 py-16 lg:py-24 text-center">
                    <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">News & Articles</h1>
                    <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                       Press releases, program updates, student stories and research summaries.
                    </p>
                    <div className="mt-8 max-w-md mx-auto">
                       <form className="flex gap-2">
                            <Input type="email" placeholder="Enter your email" className="flex-grow" />
                            <Button type="submit"><Mail className="mr-2 h-4 w-4"/> Subscribe for Updates</Button>
                       </form>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-16 lg:py-24">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                     {loading ? (
                        <p>Loading posts...</p>
                    ) : error ? (
                        <p className="text-red-500">{error}</p>
                    ) : (
                        posts.map(post => (
                            <Card key={post.id} className="flex flex-col">
                                <CardHeader>
                                    <div className="text-sm font-medium text-gray-500 mb-2 w-fit">{post.category_name}</div>
                                    <CardTitle className="text-xl leading-tight">{post.title}</CardTitle>
                                    <div className="text-sm text-muted-foreground pt-2">
                                        By {post.author} on {new Date(post.published_at).toLocaleDateString()}
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <p className="text-muted-foreground">{post.excerpt}</p>
                                </CardContent>
                                <CardFooter className="flex justify-between items-center">
                                    <Button variant="link" className="p-0">Read article →</Button>
                                    <div className="flex gap-2 text-muted-foreground">
                                        <Share2 className="h-5 w-5 cursor-pointer hover:text-primary"/>
                                    </div>
                                </CardFooter>
                                <div className="p-6 pt-0">
                                    <div className="flex flex-wrap gap-2">
                                        {post.tags.map(tag => <div key={tag} className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-gray-600 bg-gray-200 last:mr-0 mr-1">{tag}</div>)}
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            </main>
        </div>
    )
}
