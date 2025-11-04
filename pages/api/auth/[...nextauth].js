// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import User from "../../../models/User";
import { dbConnect } from "../../../lib/dbConnect";

// Handle MongoDB client connection properly for different environments
let client;
let clientPromise;

if (process.env.NODE_ENV === "test") {
  // In test environment, don't create MongoDB connections to prevent open handles
  client = null;
  clientPromise = null;
} else if (process.env.MONGODB_URI) {
  // Use global variable to prevent multiple connections during hot reloads
  if (!global._mongoClientPromise) {
    client = new MongoClient(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
}

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await dbConnect();
        const user = await User.findOne({ email: credentials.email });

        if (!user) return null;

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password_hash
        );
        if (!isPasswordValid) return null;

        return {
          id: user._id.toString(),
          email: user.email,
          name: `${user.first_name} ${user.last_name}`,
          first_name: user.first_name,
          last_name: user.last_name,
          profile_image_url: user.profile_image_url,
          location: user.location,
          description: user.description,
          role: user.role,
          stats: user.stats,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      console.log('\n=== JWT CALLBACK START ===');
      console.log('Trigger:', trigger);
      console.log('Has user object:', !!user);
      console.log('Token ID:', token.id);
      
      // Initial sign in
      if (user) {
        console.log('🟢 Initial sign in - setting token from user object');
        token.id = user.id;
        token.role = user.role;
        token.first_name = user.first_name;
        token.last_name = user.last_name;
        token.profile_image_url = user.profile_image_url;
        token.location = user.location;
        token.description = user.description;
        token.stats = user.stats;
        console.log('Set token.first_name:', token.first_name);
        console.log('Set token.last_name:', token.last_name);
      }

      // Handle session update trigger (when updateSession is called)
      if (trigger === "update") {
        console.log('🔄 Update trigger detected - fetching fresh data from DB');
        console.log('Token ID to query:', token.id);
        
        try {
          await dbConnect();
          console.log('Database connected');
          
          const freshUser = await User.findById(token.id).select('-password_hash');
          
          console.log('Fresh user from DB:', freshUser ? 'Found' : 'Not found');
          
          if (freshUser) {
            console.log('Fresh user data:', {
              id: freshUser._id.toString(),
              first_name: freshUser.first_name,
              last_name: freshUser.last_name,
              location: freshUser.location,
              description: freshUser.description,
              profile_image_url: freshUser.profile_image_url ? 'Has URL' : 'No URL',
            });
            
            // Update token with fresh data
            token.first_name = freshUser.first_name;
            token.last_name = freshUser.last_name;
            token.profile_image_url = freshUser.profile_image_url;
            token.location = freshUser.location;
            token.description = freshUser.description;
            token.stats = freshUser.stats;
            token.role = freshUser.role;
            
            console.log('✅ Token updated successfully');
            console.log('New token.first_name:', token.first_name);
            console.log('New token.last_name:', token.last_name);
          } else {
            console.log('❌ No fresh user found in database');
          }
        } catch (error) {
          console.error("❌ Error refreshing user data:", error);
        }
      }

      console.log('=== JWT CALLBACK END ===\n');
      return token;
    },

    async session({ session, token }) {
      console.log('\n=== SESSION CALLBACK START ===');
      console.log('Token data:', {
        id: token.id,
        first_name: token.first_name,
        last_name: token.last_name,
        location: token.location,
      });
      
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.first_name = token.first_name;
        session.user.last_name = token.last_name;
        session.user.profile_image_url = token.profile_image_url;
        session.user.location = token.location;
        session.user.description = token.description;
        session.user.stats = token.stats;
        
        // Also update the name field
        session.user.name = `${token.first_name} ${token.last_name}`;
        session.user.image = token.profile_image_url;
      }
      
      console.log('Session user data:', {
        id: session.user?.id,
        first_name: session.user?.first_name,
        last_name: session.user?.last_name,
        name: session.user?.name,
      });
      console.log('=== SESSION CALLBACK END ===\n');
      
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
  
  // Enable debug in development
  debug: process.env.NODE_ENV === 'development',
  
  // Important: Use JWT strategy
  session: {
    strategy: "jwt",
  },
};

export default NextAuth(authOptions);
export { authOptions };
