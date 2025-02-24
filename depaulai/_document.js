import Document, { Html, Head, Main, NextScript } from 'next/document';
// pages/_app.js
import '@fullcalendar/core/main.css';  // Import Core styles
import '@fullcalendar/daygrid/main.css'; // Import DayGrid styles


class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
