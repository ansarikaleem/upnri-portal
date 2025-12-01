NewsTicker.js
import React from 'react';
import Link from 'next/link';

export default function NewsTicker({ news }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
        Latest News
      </h2>
      
      <div className="space-y-4">
        {news.map((item) => (
          <div key={item.id} className="border-b pb-4 last:border-b-0 last:pb-0">
            <Link href={`/news/${item.id}`}>
              <div className="cursor-pointer hover:bg-gray-50 p-2 rounded">
                <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                  {item.excerpt}
                </p>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>{new Date(item.date).toLocaleDateString()}</span>
                  <span className="text-primary-600 hover:text-primary-700">
                    Read more →
                  </span>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-center">
        <Link 
          href="/news"
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          View All News
        </Link>
      </div>
    </div>
  );
}