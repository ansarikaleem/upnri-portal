import '../styles/globals.css';
import { useEffect } from 'react';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Remove loading class on mount
    document.body.classList?.remove('loading');
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;