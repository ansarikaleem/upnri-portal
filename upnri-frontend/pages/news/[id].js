import React from 'react';
import Head from 'next/head';
import Layout from '../../components/Layout/Layout';
import { useRouter } from 'next/router';

export default function NewsDetail() {
  const router = useRouter();
  const { id } = router.query;

  // Mock data - replace with actual API call
  const news = {
    id: 1,
    title: 'UPNRI Forum Annual Meet 2024',
    content: `
      <p>We are excited to announce our Annual Community Meet 2024! This year's event promises to be bigger and better than ever before.</p>
      
      <h3>Event Details:</h3>
      <ul>
        <li><strong>Date:</strong> February 15, 2024</li>
        <li><strong>Time:</strong> 6:00 PM onwards</li>
        <li><strong>Venue:</strong> Grand Ballroom, Kuwait City</li>
        <li><strong>Dress Code:</strong> Traditional Indian Attire</li>
      </ul>

      <p>This year's event will feature:</p>
      <ul>
        <li>Cultural performances from different regions of Uttar Pradesh</li>
        <li>Traditional cuisine from various districts</li>
        <li>Networking opportunities with community members</li>
        <li>Recognition of outstanding community contributors</li>
        <li>Business networking session</li>
      </ul>

      <p>We encourage all members to register early as seats are limited. Family and friends are welcome!</p>
    `,
    excerpt: 'Join us for the annual community gathering of UPNRI Forum Kuwait',
    featuredImage: '/images/news1.jpg',
    publishedAt: '2024-01-15T10:00:00Z',
    author: 'Admin Team'
  };

  if (router.isFallback) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>{news.title} - UPNRI Forum Kuwait</title>
        <meta name="description" content={news.excerpt} />
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <article className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
            {news.featuredImage && (
              <img 
                src={news.featuredImage} 
                alt={news.title}
                className="w-full h-64 md:h-96 object-cover"
              />
            )}
            
            <div className="p-6 md:p-8">
              <div className="mb-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{news.title}</h1>
                
                <div className="flex items-center text-sm text-gray-600 mb-6">
                  <span>Published on {new Date(news.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                  <span className="mx-2">•</span>
                  <span>By {news.author}</span>
                </div>
              </div>

              <div 
                className="prose max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: news.content }}
              />

              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => router.push('/news')}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  ← Back to News
                </button>
              </div>
            </div>
          </article>
        </div>
      </div>
    </Layout>
  );
}