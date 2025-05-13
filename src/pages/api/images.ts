
import type { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { Image, ImageStats } from '@/types/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const client = await clientPromise;
      const db = client.db();
      
      // In a real app, we would get the userId from the session
      // For now, let's use a mock userId
      const mockUserId = new ObjectId('60d0fe4f5311236168a109ca');
      
      // Get filter from query params
      const { filter = 'all' } = req.query;
      
      // Build query based on filter
      const query: any = { userId: mockUserId };
      if (filter === 'public') query.isPublic = true;
      if (filter === 'private') query.isPublic = false;
      
      // Get images
      const images = await db
        .collection('images')
        .find(query)
        .sort({ createdAt: -1 })
        .limit(20)
        .toArray();
      
      // Get image stats
      const stats: ImageStats = {
        totalImages: await db.collection('images').countDocuments({ userId: mockUserId }),
        publicImages: await db.collection('images').countDocuments({ userId: mockUserId, isPublic: true }),
        privateImages: await db.collection('images').countDocuments({ userId: mockUserId, isPublic: false }),
      };
      
      res.status(200).json({ images, stats });
    } catch (error) {
      console.error('Error fetching images:', error);
      res.status(500).json({ error: 'Failed to fetch images' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
