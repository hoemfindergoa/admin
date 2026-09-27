import type { MetadataRoute } from 'next'
import { readBlog } from "@/lib/actions/blog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap>  {
    let { data: blogs } = await readBlog();

    // Map blogs to postEntries with required properties
    const postEntries = blogs?.map((blog) => ({
        url: `${process.env.SITE_URL}/blog/${blog?.slug}`,
        lastModified: new Date(blog.created_at),
        changeFrequency: 'weekly', // Default value
        priority: 0.5, // Default value
    }));

    // Static entries for aboutus, privacypolicy, contactus
    const staticEntries = [
        { url: `${process.env.SITE_URL}/aboutus` },
        { url: `${process.env.SITE_URL}/contactus` },
    ];

    // Combine static entries with postEntries
    const allEntries: MetadataRoute.Sitemap = [...staticEntries, ...(postEntries ?? []) ];

    return allEntries;
}
