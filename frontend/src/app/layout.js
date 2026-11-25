import "./globals.css";

export const metadata = {
  title: "BizAssist AI | Universal Business Assistant",
  description:
    "Build intelligent AI assistants for businesses using their own knowledge base.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}