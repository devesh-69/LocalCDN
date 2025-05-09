import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { z } from "zod";
import bcrypt from "bcryptjs";

/**
 * This is a temporary mock authentication provider.
 * In production, we connect to the MongoDB database.
 */
const mockUsers = [
  {
    id: "1",
    name: "Demo User",
    email: "user@example.com",
    password: "password123", // In a real app, this would be hashed
  },
];

export const authOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Validate the credentials format
        const validationSchema = z.object({
          email: z.string().email("Invalid email format"),
          password: z.string().min(8, "Password must be at least 8 characters"),
        });

        try {
          // Validate the credentials format
          validationSchema.parse(credentials);

          await connectDB();

          // Find the user
          const user = await User.findOne({ email: credentials.email }).select(
            "+password"
          );

          if (!user) {
            return null;
          }

          // Verify password
          const isMatch = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isMatch) {
            return null;
          }

          // Return the user without the password
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            image: user.image,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    signUp: "/auth/signup",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Add user information to the JWT token
      if (user) {
        token.id = user.id;
        
        // Get the user's session version and add it to the token
        try {
          await connectDB();
          const dbUser = await User.findById(user.id);
          if (dbUser) {
            token.sessionVersion = dbUser.sessionVersion || 0;
          }
        } catch (error) {
          console.error('Error getting user sessionVersion:', error);
        }
      }
      
      // If the session is being updated, check if we need to update the token
      if (trigger === 'update' && session?.sessionVersion) {
        token.sessionVersion = session.sessionVersion;
      }
      
      // Check if we need to verify the session version
      if (token.id && token.sessionVersion !== undefined) {
        try {
          await connectDB();
          const dbUser = await User.findById(token.id);
          
          // If DB version is newer than token version, this session has been invalidated
          if (dbUser && (dbUser.sessionVersion || 0) > (token.sessionVersion || 0)) {
            // Return empty object to force sign out
            return {};
          }
        } catch (error) {
          console.error('Error validating sessionVersion:', error);
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      // Add user ID to the session
      if (session.user) {
        session.user.id = token.id as string;
        // Add sessionVersion to session so it can be updated
        session.sessionVersion = token.sessionVersion;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || "a-fallback-secret-for-development",
}; 