import React from 'react';
import Link from 'next/link';

export default function OfficeBearers({ bearers }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-2">
        Office Bearers
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {bearers.map((bearer) => (
          <div key={bearer.id} className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-200 rounded-full overflow-hidden">
              <img 
                src={bearer.image} 
                alt={bearer.name}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">
              {bearer.name}
            </h3>
            <p className="text-primary-600 text-sm mb-2">
              {bearer.position}
            </p>
            <Link 
              href={bearer.profile}
              className="text-xs text-gray-600 hover:text-primary-600"
            >
              View Profile →
            </Link>
          </div>
        ))}
      </div>
      
      <div className="mt-6 text-center">
        <Link 
          href="/office-bearers"
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          View All Office Bearers
        </Link>
      </div>
    </div>
  );
}