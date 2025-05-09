import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/layout/Container";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-black">
        <Container className="text-center max-w-6xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-primary-dark">
            <span className="text-primary">LocalCDN</span>: Your Professional Image Management Platform
          </h1>
          <p className="text-lg md:text-xl text-neutral-700 dark:text-neutral-300 mb-8 max-w-3xl mx-auto">
            Upload, manage, and share your images with complete metadata control. 
            Built with privacy and organization in mind.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="font-medium">
              Get Started
            </Button>
            <Button size="lg" variant="outline" className="font-medium">
              Learn More
            </Button>
          </div>
          <div className="mt-16 relative">
            <div className="absolute -inset-4 bg-primary/5 rounded-lg -z-10" />
            <div className="rounded-lg border border-neutral-200 shadow-lg dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 flex items-center justify-center h-[300px] md:h-[400px] lg:h-[500px]">
              <div className="text-center">
                <h3 className="text-xl md:text-2xl font-bold text-primary mb-4">Dashboard Preview</h3>
                <p className="text-neutral-600 dark:text-neutral-400">Image management dashboard with intuitive interface for organizing and editing your images.</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <Container>
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-primary-dark">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-neutral-900 p-6 rounded-lg border border-neutral-100 dark:border-neutral-800 shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6 text-primary" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-primary-dark">Image Upload</h3>
              <p className="text-neutral-700 dark:text-neutral-300">
                Upload images from your local machine with drag-and-drop support and real-time progress tracking.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white dark:bg-neutral-900 p-6 rounded-lg border border-neutral-100 dark:border-neutral-800 shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6 text-primary" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-primary-dark">Metadata Control</h3>
              <p className="text-neutral-700 dark:text-neutral-300">
                Strip all metadata for privacy or edit custom EXIF fields, titles, descriptions, and tags.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white dark:bg-neutral-900 p-6 rounded-lg border border-neutral-100 dark:border-neutral-800 shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6 text-primary" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-primary-dark">Gallery View</h3>
              <p className="text-neutral-700 dark:text-neutral-300">
                Browse your images in a responsive grid with infinite scroll and advanced filtering options.
              </p>
            </div>
            
            {/* Feature 4 */}
            <div className="bg-white dark:bg-neutral-900 p-6 rounded-lg border border-neutral-100 dark:border-neutral-800 shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6 text-primary" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-primary-dark">Sharing</h3>
              <p className="text-neutral-700 dark:text-neutral-300">
                Copy public URLs for easy embedding and sharing of your images on other platforms.
              </p>
            </div>
            
            {/* Feature 5 */}
            <div className="bg-white dark:bg-neutral-900 p-6 rounded-lg border border-neutral-100 dark:border-neutral-800 shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6 text-primary" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-primary-dark">Image Editing</h3>
              <p className="text-neutral-700 dark:text-neutral-300">
                Basic in-browser editing including crop, rotate, and annotation tools without external software.
              </p>
            </div>
            
            {/* Feature 6 */}
            <div className="bg-white dark:bg-neutral-900 p-6 rounded-lg border border-neutral-100 dark:border-neutral-800 shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6 text-primary" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-primary-dark">Privacy Controls</h3>
              <p className="text-neutral-700 dark:text-neutral-300">
                Set public or private access for your galleries and control who can view your images.
              </p>
            </div>
          </div>
        </Container>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-primary/5 dark:bg-primary/10">
        <Container className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-primary-dark">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-neutral-700 dark:text-neutral-300 mb-8 max-w-2xl mx-auto">
            Join LocalCDN today and take control of your image management with our powerful, privacy-focused platform.
          </p>
          <Button size="lg" className="font-medium">
            Create Your Account
          </Button>
        </Container>
      </section>
    </>
  );
}
