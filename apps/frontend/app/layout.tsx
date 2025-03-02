import "./globals.css";
import NavbarWithSearch from "./components/NavbarWithSearch";
import Footer from "./components/Footer";
import ApolloClientProvider from "./graphql/ApolloClientProvider";
import { AuthProvider } from "./components/AuthContext";
import { PageProvider } from "./components/PageContext";
import { ServicesProvider } from "./components/ServicesContext";

import { Metadata } from "next";
import { UnitsProvider } from "./components/UnitsContext";
import RouteChangeSpinner from "./components/RouteChangeSpinner";

export const metadata: Metadata = {
  title: "Mercado de Obra",
  description: "Conectando profissionais da construção civil",
  icons: { icon: "/icons/m/m8.svg" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />
      </head>
      <body
        suppressHydrationWarning
        className="bg-gray-100 font-inter dark:bg-darkBg text-gray-900 dark:text-tertiary"
      >
        <ApolloClientProvider>
          <AuthProvider>
            <ServicesProvider>
              <PageProvider>
                <UnitsProvider>
                  <RouteChangeSpinner />
                  <NavbarWithSearch />
                  <main className="min-h-screen my-4">{children}</main>
                  <Footer />
                </UnitsProvider>
              </PageProvider>
            </ServicesProvider>
          </AuthProvider>
        </ApolloClientProvider>
      </body>
    </html>
  );
}
