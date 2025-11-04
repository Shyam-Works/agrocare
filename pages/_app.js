// pages/_app.js
import Head from "next/head";
import { SessionProvider } from "next-auth/react";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  return (
    <SessionProvider session={session}>
      <>
        <Head>
          {/* Font Awesome */}
          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
          />

          {/* Tailwind (you usually don’t need this if you already use postcss config, but leaving as per your code) */}
          <script src="https://cdn.tailwindcss.com" async></script>

          {/* Google Fonts: Newsreader */}
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,500;1,500&display=swap" rel="stylesheet"/>
        </Head>

        <Component {...pageProps} />
      </>
    </SessionProvider>
  );
}
