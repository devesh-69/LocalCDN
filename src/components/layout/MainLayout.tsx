import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import Script from 'next/script';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-primary">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 animate-fade-in">
        {children}
      </main>
      <Footer />
      
      {/* GSAP for animations */}
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js" strategy="afterInteractive" />
      <Script id="gsap-init" strategy="afterInteractive">
        {`
          if (typeof gsap !== 'undefined') {
            // Page load animations
            gsap.from(".gallery-item", { 
              opacity: 0, 
              y: 20, 
              duration: 0.6, 
              stagger: 0.1 
            });
            
            // Button hover animations
            document.querySelectorAll('.btn-primary, .btn-warning').forEach(button => {
              button.addEventListener('mouseenter', () => {
                gsap.to(button, { scale: 1.05, duration: 0.2, ease: "power1.inOut" });
              });
              button.addEventListener('mouseleave', () => {
                gsap.to(button, { scale: 1, duration: 0.2, ease: "power1.inOut" });
              });
            });
          }
        `}
      </Script>
    </div>
  );
} 