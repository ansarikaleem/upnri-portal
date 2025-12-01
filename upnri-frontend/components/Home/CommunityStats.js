import React from 'react';

export default function CommunityStats() {
  const stats = [
    { label: 'Active Members', value: '1,200+', color: 'text-blue-600' },
    { label: 'Events Organized', value: '50+', color: 'text-green-600' },
    { label: 'Business Listings', value: '25+', color: 'text-purple-600' },
    { label: 'Districts Represented', value: '15+', color: 'text-orange-600' },
  ];

  return (
    <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg text-white p-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Community Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="text-center">
            <div className={`text-3xl md:text-4xl font-bold ${stat.color} mb-2`}>
              {stat.value}
            </div>
            <div className="text-sm md:text-base opacity-90">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}