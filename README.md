# LocalCDN

A professional, full-stack image management website built with Next.js 15. LocalCDN allows users to upload, manage, and share images with complete metadata control.

## Features

- **Image Upload**: Upload images from your local machine with drag-and-drop support
- **Metadata Control**: Option to strip all metadata or edit custom fields
- **Gallery View**: Browse images in a responsive grid with infinite scroll
- **Search & Filter**: Find images by name, description, tags, or custom metadata
- **URL Sharing**: Copy public URLs for embedding images elsewhere
- **Image Editing**: Basic in-browser editing capabilities
- **Privacy Controls**: Set public or private access for your galleries

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React, TypeScript, Tailwind CSS, DaisyUI
- **Authentication**: NextAuth.js
- **Database**: MongoDB Atlas (free tier)
- **Storage**: Cloudinary (free tier)
- **Image Processing**: Sharp.js

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- MongoDB Atlas account
- Cloudinary account

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/localcdn.git
   cd localcdn
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   bun install
   ```

3. Create a `.env.local` file based on `.env.example` and add your configuration variables

4. Run the development server
   ```bash
   npm run dev
   # or
   bun dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

- `/app` - Next.js app router routes and page components
- `/components` - Reusable UI components
- `/lib` - Utility functions and shared logic
- `/types` - TypeScript type definitions
- `/public` - Static assets

## Deployment

This application can be deployed on Vercel with zero configuration:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourusername%2Flocalcdn)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
