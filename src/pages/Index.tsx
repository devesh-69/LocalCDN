
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/95">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container px-4 py-24 md:py-32">
          <div className="flex flex-col items-center text-center space-y-8 animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Professional Image Management
              <span className="text-primary block mt-2">Made Simple</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Upload, store, and manage your images with powerful metadata control.
              The secure, organized solution for photographers and content creators.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/register">
                <Button className="bg-primary hover:bg-primary/80 px-8 py-6 text-lg">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" className="glass-effect px-8 py-6 text-lg">
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="container px-4 py-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage your image collection
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-6 rounded-lg">
              <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Secure Storage</h3>
              <p className="text-muted-foreground">
                Your images are securely stored with advanced encryption and privacy controls.
              </p>
            </div>
            
            <div className="glass-card p-6 rounded-lg">
              <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Metadata Control</h3>
              <p className="text-muted-foreground">
                Complete control over image metadata with privacy-conscious stripping options.
              </p>
            </div>
            
            <div className="glass-card p-6 rounded-lg">
              <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Easy Sharing</h3>
              <p className="text-muted-foreground">
                Generate CDN links and control access to your images with granular permissions.
              </p>
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="glass-navbar py-8">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-primary text-2xl font-bold mb-4 md:mb-0">localCDN</div>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} localCDN. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
