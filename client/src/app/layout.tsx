import type { Metadata } from 'next';
import ClientWrapper from './components/ClientWrapper';
import './globals.css';
import Providers from './components/Providers';

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <html lang="en">
        <body>
          <Providers>
            {children}
            <ClientWrapper />
          </Providers>
        </body>
      </html>
    </>
  );
}