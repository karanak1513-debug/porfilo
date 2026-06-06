import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Karan Kumar | Digital Marketing & Web Design Portfolio",
  description: "Portfolio of Karan Kumar - Digital Marketing Intern, Website Designer, and SEO & AI Tools Enthusiast. View my work, experience, certifications, and contact details.",
  keywords: "Karan Kumar, Digital Marketing Intern, Web Designer, SEO Consultant, AI Tools, Geeta University, TalentGrow Global",
  authors: [{ name: "Karan Kumar" }],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <head>
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
          precedence="default"
        />
      </head>
      <body>
        {/* Background Gradient Effects */}
        <div className="bg-gradient-glow"></div>
        <div className="bg-glow-1"></div>
        <div className="bg-glow-2"></div>
        {children}
      </body>
    </html>
  );
}
