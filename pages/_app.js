// pages/_app.js
import Head from 'next/head';
import { SessionProvider } from "next-auth/react"

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <>
        <Head>
          <link 
            rel="stylesheet" 
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" 
          />
          <script src="https://cdn.tailwindcss.com" async></script>
        </Head>
        
        <Component {...pageProps} />
      </>
    </SessionProvider>
  );
}