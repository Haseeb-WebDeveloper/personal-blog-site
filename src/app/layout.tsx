import "./globals.css";


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" >
      <head>
        <link rel="icon" href="/logo.jpg" type="image/x-icon" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
