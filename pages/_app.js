import Head from 'next/head';


export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" 
        />
        <script src="https://cdn.tailwindcss.com"></script>
      </Head>
      
      <Component {...pageProps} />
    </>
  );
}