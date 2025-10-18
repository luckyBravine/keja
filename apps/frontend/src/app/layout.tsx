import './global.css';

export const metadata = {
  title: 'Welcome to ',
  description: 'Keja - Find Your Perfect Home',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
