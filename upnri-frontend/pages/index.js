import React from 'react';
import Head from 'next/head';
import Layout from '../components/Layout/Layout';
import NewsTicker from '../components/News/NewsTicker';
import EventSlider from '../components/Events/EventSlider';
import OfficeBearers from '../components/Members/OfficeBearers';
import CommunityStats from '../components/Home/CommunityStats';
import ImageSlider from '../components/Home/ImageSlider';
import axios from 'axios';

// Create a server-side axios instance without auth interceptors
const serverApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default function Home({ news, events, officeBearers }) {
  return (
    <Layout>
      <Head>
        <title>UPNRI Forum Kuwait - Home</title>
        <meta name="description" content="United Province NRI Forum Kuwait - Connecting UP community in Kuwait" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        {/* Main Slider */}
        <ImageSlider />
        
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Left Side - Events */}
            <div className="lg:col-span-2">
              <EventSlider events={events} />
            </div>
            
            {/* Right Side - News Ticker */}
            <div className="lg:col-span-1">
              <NewsTicker news={news} />
            </div>
          </div>
          
          {/* Office Bearers */}
          <div className="mb-8">
            <OfficeBearers bearers={officeBearers} />
          </div>
          
          {/* Community Stats */}
          <CommunityStats />
        </div>
      </div>
    </Layout>
  );
}

export async function getServerSideProps() {
  try {
    // Fetch news and events from the backend API using server-side axios
    const [newsResponse, eventsResponse] = await Promise.all([
      serverApi.get('/news', { 
        params: {
          limit: 10, 
          page: 1,
          status: 'published'
        }
      }),
      serverApi.get('/events', { 
        params: {
          limit: 6,
          page: 1,
          status: 'published'
        }
      })
    ]);

    console.log('News API Response:', newsResponse.data);
    console.log('Events API Response:', eventsResponse.data);

    // Extract data from responses based on your backend structure
    const newsData = newsResponse.data;
    const eventsData = eventsResponse.data;

    // Handle different response structures
    const news = newsData?.news || newsData?.data || newsData || [];
    const events = eventsData?.events || eventsData?.data || eventsData || [];

    console.log('Processed News:', news);
    console.log('Processed Events:', events);

    // Transform news data to match frontend expectations
    const transformedNews = news.map(item => ({
      id: item.id,
      title: item.title,
      excerpt: item.excerpt || (item.content ? item.content.substring(0, 150) + '...' : ''),
      date: item.publishedAt || item.createdAt,
      image: item.featuredImage || '/images/news-default.jpg'
    }));

    // Transform events data to match frontend expectations
    const transformedEvents = events.map(item => ({
      id: item.id,
      title: item.title,
      slug:item.registrationSlug,
      date: item.eventDate || item.date,
      venue: item.venue || 'TBA',
      image: item.featuredImage || '/images/event-default.jpg'
    }));

    // Office bearers data
    const officeBearers = [
      {
        id: 1,
        name: 'Dr. Rajesh Kumar',
        position: 'President',
        image: '/images/bearer1.jpg',
        profile: '/members/1'
      },
      {
        id: 2,
        name: 'Mr. Amit Singh',
        position: 'Secretary',
        image: '/images/bearer2.jpg',
        profile: '/members/2'
      }
    ];

    return {
      props: {
        news: transformedNews,
        events: transformedEvents,
        officeBearers
      }
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    
    // Fallback data in case API fails
    const fallbackNews = [
      {
        id: 1,
        title: 'UPNRI Forum Annual Meet 2024',
        excerpt: 'Join us for the annual community gathering',
        date: '2024-01-15',
        image: '/images/news1.jpg'
      },
      {
        id: 2,
        title: 'New Business Directory Launched',
        excerpt: 'Explore businesses owned by community members',
        date: '2024-01-10',
        image: '/images/news2.jpg'
      }
    ];

    const fallbackEvents = [
      {
        id: 1,
        title: 'Community Dinner',
        date: '2024-02-01',
        venue: 'Grand Hotel Kuwait',
        image: '/images/event1.jpg'
      },
      {
        id: 2,
        title: 'Business Networking Event',
        date: '2024-02-15',
        venue: 'Business Center',
        image: '/images/event2.jpg'
      }
    ];

    const officeBearers = [
      {
        id: 1,
        name: 'Dr. Rajesh Kumar',
        position: 'President',
        image: '/images/bearer1.jpg',
        profile: '/members/1'
      },
      {
        id: 2,
        name: 'Mr. Amit Singh',
        position: 'Secretary',
        image: '/images/bearer2.jpg',
        profile: '/members/2'
      }
    ];

    return {
      props: {
        news: fallbackNews,
        events: fallbackEvents,
        officeBearers
      }
    };
  }
}