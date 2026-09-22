import "./globals.css";

export const metadata = {
  title: "Kiln",
  description: "A quiet room for public writing. A new hour, a new firing.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="grain" />
        {children}
      </body>
    </html>
  );
}
