// src/app/layout.tsx (Server-side layout)

export const metadata = {
  title: "Depaul Friend",
  description: "Ask your depaul friend anything",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light">
      <body className="min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
