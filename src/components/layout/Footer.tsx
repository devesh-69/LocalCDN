import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full footer-blur py-6 mt-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link 
              href="/" 
              className="font-secondary text-primary text-xl font-bold"
            >
              LocalCDN
            </Link>
            <p className="text-sm mt-1">
              Professional image management with metadata control
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center md:justify-end gap-8 md:gap-12">
            <div className="flex flex-col space-y-2">
              <h3 className="font-medium text-text">Features</h3>
              <Link href="/upload" className="text-sm hover:text-primary transition-colors duration-300">Upload</Link>
              <Link href="/gallery" className="text-sm hover:text-primary transition-colors duration-300">Gallery</Link>
              <Link href="/metadata" className="text-sm hover:text-primary transition-colors duration-300">Metadata</Link>
            </div>
            
            <div className="flex flex-col space-y-2">
              <h3 className="font-medium text-text">Resources</h3>
              <Link href="/docs" className="text-sm hover:text-primary transition-colors duration-300">Documentation</Link>
              <Link href="/faq" className="text-sm hover:text-primary transition-colors duration-300">FAQ</Link>
              <Link href="/privacy" className="text-sm hover:text-primary transition-colors duration-300">Privacy</Link>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-opacity-10 text-center text-sm">
          <p>© {new Date().getFullYear()} LocalCDN. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
} 