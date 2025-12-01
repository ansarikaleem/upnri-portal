import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../../components/Layout/Layout';

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/gallery');
      const data = await response.json();
      
      if (response.ok) {
        setImages(data.images);
      }
    } catch (error) {
      console.error('Error fetching gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  const openLightbox = (image) => {
    setSelectedImage(image);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  return (
    <Layout>
      <Head>
        <title>Gallery - UPNRI Forum Kuwait</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Gallery</h1>
            <p className="text-gray-600">Memories from our events and gatherings</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                  <div className="h-64 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((image) => (
                <div 
                  key={image.id} 
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => openLightbox(image)}
                >
                  <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                    <img 
                      src={image.imagePath} 
                      alt={image.title || 'Gallery image'}
                      className="w-full h-64 object-cover"
                    />
                  </div>
                  <div className="p-4">
                    {image.title && (
                      <h3 className="font-semibold text-gray-900 mb-2">{image.title}</h3>
                    )}
                    {image.description && (
                      <p className="text-gray-600 text-sm line-clamp-2">{image.description}</p>
                    )}
                    {image.event && (
                      <p className="text-primary-600 text-xs mt-2">From: {image.event.title}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && images.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <p className="text-gray-500 text-lg">No images in gallery yet.</p>
              <p className="text-gray-400 text-sm mt-2">
                Check back after our next event!
              </p>
            </div>
          )}
        </div>

        {/* Lightbox Modal */}
        {selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
            <div className="max-w-4xl max-h-full">
              <div className="relative">
                <button
                  onClick={closeLightbox}
                  className="absolute -top-12 right-0 text-white text-2xl hover:text-gray-300"
                >
                  ✕
                </button>
                <img 
                  src={selectedImage.imagePath} 
                  alt={selectedImage.title || 'Gallery image'}
                  className="max-w-full max-h-[80vh] object-contain"
                />
                {(selectedImage.title || selectedImage.description) && (
                  <div className="bg-white p-4 mt-2 rounded">
                    {selectedImage.title && (
                      <h3 className="font-semibold text-gray-900 mb-2">{selectedImage.title}</h3>
                    )}
                    {selectedImage.description && (
                      <p className="text-gray-600">{selectedImage.description}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}