"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MoreHorizontal, PlusCircle, Edit, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Types
type PostStatus = 'Published' | 'Draft' | 'Archived';
type Post = {
  id: string;
  title: string;
  category: string;
  status: PostStatus;
  published_at: string;
};
type Category = { id: string; name: string; slug: string };
type Tag = { id: string; name: string; slug: string };

// Mock Data
const mockPosts: Post[] = [
  { id: '1', title: 'Idrisa Foundation Launches 2026 STEM Olympiad Pilot', category: 'Press Releases', status: 'Published', published_at: '2026-02-12' },
  { id: '2', title: 'From Kitovu to Code: How a Scholarship Helped Aisha Build a Robotics Project', category: 'Student Stories', status: 'Published', published_at: '2026-03-05' },
  { id: '3', title: 'Summary: Open Textbooks and STEM Performance', category: 'Research Summaries', status: 'Published', published_at: '2026-01-18' },
  { id: '4', title: 'Upcoming: Annual General Meeting', category: 'Event Recaps', status: 'Draft', published_at: '' },
];
const mockCategories: Category[] = [
    {id: '1', name: 'Press Releases', slug: 'press-releases'},
    {id: '2', name: 'Program Updates', slug: 'program-updates'},
    {id: '3', name: 'Student Stories', slug: 'student-stories'},
];
const mockTags: Tag[] = [{id: '1', name: 'STEM', slug: 'stem'}, {id: '2', name: 'Scholarships', slug: 'scholarships'}];

const statusColors: Record<PostStatus, string> = {
    'Published': 'bg-green-100 text-green-800',
    'Draft': 'bg-yellow-100 text-yellow-800',
    'Archived': 'bg-gray-100 text-gray-800',
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [tags, setTags] = useState<Tag[]>(mockTags);

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Blog Management</h1>
          <p className="text-muted-foreground">Create and manage your articles, categories, and tags.</p>
        </div>
        <Button><PlusCircle className="mr-2 h-4 w-4" /> New Post</Button>
      </div>

      <Tabs defaultValue="posts">
        <TabsList>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="tags">Tags</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-6">
          <Card>
            <CardHeader><CardTitle>All Posts</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Category</TableHead><TableHead>Status</TableHead><TableHead>Published</TableHead><TableHead><span className="sr-only">Actions</span></TableHead></TableRow></TableHeader>
                <TableBody>
                  {posts.map(post => (
                    <TableRow key={post.id}>
                      <TableCell className="font-medium">{post.title}</TableCell>
                      <TableCell>{post.category}</TableCell>
                      <TableCell><div className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[post.status]}`}>{post.status}</div></TableCell>
                      <TableCell>{post.published_at ? new Date(post.published_at).toLocaleDateString() : '—'}</TableCell>
                      <TableCell>
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem><Edit className="mr-2 h-4 w-4"/> Edit</DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600"><Trash2 className="mr-2 h-4 w-4"/> Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="categories" className="mt-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Categories</CardTitle>
                        <CardDescription>Manage your post categories.</CardDescription>
                    </div>
                    <Button size="sm"><PlusCircle className="mr-2 h-4 w-4"/> New Category</Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Slug</TableHead><TableHead><span className="sr-only">Actions</span></TableHead></TableRow></TableHeader>
                        <TableBody>
                            {categories.map(cat => <TableRow key={cat.id}><TableCell>{cat.name}</TableCell><TableCell>{cat.slug}</TableCell><TableCell className="text-right"><Button variant="ghost" size="sm"><Edit className="h-4 w-4"/></Button></TableCell></TableRow>)}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="tags" className="mt-6">
            <Card>
                 <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Tags</CardTitle>
                        <CardDescription>Manage your post tags.</CardDescription>
                    </div>
                    <Button size="sm"><PlusCircle className="mr-2 h-4 w-4"/> New Tag</Button>
                </CardHeader>
                 <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Slug</TableHead><TableHead><span className="sr-only">Actions</span></TableHead></TableRow></TableHeader>
                        <TableBody>
                            {tags.map(tag => <TableRow key={tag.id}><TableCell>{tag.name}</TableCell><TableCell>{tag.slug}</TableCell><TableCell className="text-right"><Button variant="ghost" size="sm"><Edit className="h-4 w-4"/></Button></TableCell></TableRow>)}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
