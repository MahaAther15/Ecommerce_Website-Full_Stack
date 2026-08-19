import MainLayout from "./Components/Layout/MainLayout";
import "./globals.css";
import StoreProvider from "./redux/StoreProvider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
        <link
          rel="stylesheet"
          href="https://pro.fontawesome.com/releases/v5.10.0/css/all.css"
        />
      </head>
      <body className="flex flex-col min-h-screen">
        <StoreProvider>
          <MainLayout>{children}</MainLayout>
        </StoreProvider>
      </body>
    </html>
  );
}
