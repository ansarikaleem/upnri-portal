import React from 'react';
import Head from 'next/head';
import Layout from '../components/Layout/Layout';

export default function About() {
  return (
    <Layout>
      <Head>
        <title>About Us - UPNRI Forum Kuwait</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-6">About UPNRI Forum Kuwait</h1>
              
              <div className="prose prose-lg max-w-none text-gray-700">
                <p className="lead text-xl text-gray-600 mb-8">
                  Connecting the United Province community in Kuwait through cultural preservation, 
                  mutual support, and professional networking.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Our Mission</h2>
                <p>
                  The UPNRI Forum Kuwait is dedicated to uniting people from Uttar Pradesh living in Kuwait. 
                  We strive to create a supportive community that celebrates our rich cultural heritage while 
                  helping members thrive in their personal and professional lives.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Our Vision</h2>
                <p>
                  To be the premier community organization that empowers UP-origin individuals and families 
                  in Kuwait through cultural events, educational initiatives, and professional development 
                  opportunities.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">What We Do</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
                  <div className="bg-primary-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-primary-900 mb-2">Cultural Events</h3>
                    <p className="text-primary-700">
                      Celebrate festivals, organize cultural programs, and preserve our rich traditions.
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-900 mb-2">Community Support</h3>
                    <p className="text-green-700">
                      Provide assistance and guidance to community members in need.
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-purple-900 mb-2">Professional Networking</h3>
                    <p className="text-purple-700">
                      Connect professionals and entrepreneurs for mutual growth and opportunities.
                    </p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-orange-900 mb-2">Business Directory</h3>
                    <p className="text-orange-700">
                      Promote businesses owned by community members and encourage local commerce.
                    </p>
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Our History</h2>
                <p>
                  Established in 2010, UPNRI Forum Kuwait started as a small gathering of like-minded 
                  individuals from Uttar Pradesh. Over the years, we have grown into a vibrant community 
                  of over 1,200 members, organizing numerous successful events and initiatives that 
                  have positively impacted our community.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Join Our Community</h2>
                <p>
                  Whether you're new to Kuwait or have been here for years, we welcome you to join 
                  our growing family. Together, we can achieve more and create lasting memories while 
                  staying connected to our roots.
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">Get Involved</h3>
                  <p className="text-blue-700 mb-4">
                    Ready to become part of our community? Register as a member today and start 
                    participating in our events and activities.
                  </p>
                  <div className="flex space-x-4">
                    <a
                      href="/members/register"
                      className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700"
                    >
                      Register Now
                    </a>
                    <a
                      href="/contact"
                      className="border border-primary-600 text-primary-600 px-6 py-2 rounded-md hover:bg-primary-50"
                    >
                      Contact Us
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}