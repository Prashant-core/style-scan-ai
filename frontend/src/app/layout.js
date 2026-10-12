import './globals.css';

export const metadata = {
  title: 'LookLogic AI',
  description: 'Professional face-shape analysis and styling metrics.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}