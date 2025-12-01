import React from 'react';
import Link from 'next/link';

export default function EventSlider({ events }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Upcoming Events</h2>
        <Link 
          href="/events"
          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          View All
        </Link>
      </div>
      
      <div className="space-y-4">
        {events.map((event) => (
          <div key={event.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-16 h-16 bg-primary-100 rounded-lg flex flex-col items-center justify-center">
                <span className="text-primary-600 font-bold text-lg">
                  {new Date(event.date).getDate()}
                </span>
                <span className="text-primary-600 text-xs uppercase">
                  {new Date(event.date).toLocaleString('en', { month: 'short' })}
                </span>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 mb-1">
                  {event.title}
                </h3>
                <p className="text-gray-600 text-sm mb-2">
                  📍 {event.venue}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {new Date(event.date).toLocaleDateString('en', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  <Link
                    href={`/events/register/${event.slug}`}
                    className="px-3 py-1 bg-primary-600 text-white text-sm rounded hover:bg-primary-700"
                  >
                    Register
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {events.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No upcoming events scheduled.</p>
          <p className="text-sm">Check back later for updates.</p>
        </div>
      )}
    </div>
  );
}