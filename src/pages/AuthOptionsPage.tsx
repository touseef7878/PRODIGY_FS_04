"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Apple, Chrome, Smartphone } from 'lucide-react';


const AuthOptionsPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-gradient-to-br from-blue-200 to-blue-400 dark:from-gray-800 dark:to-gray-950 p-4 text-center">
      {/* Top Section - Placeholder for image/logo */}
      <div className="flex flex-col items-center justify-center flex-grow pt-16">
        <h1 className="text-5xl font-extrabold text-white drop-shadow-lg mb-4">Prochat</h1>
        {/* Placeholder for the dynamic image section */}
        <div className="w-64 h-64 bg-blue-300/50 dark:bg-gray-700/50 rounded-full flex items-center justify-center text-white text-lg font-semibold">
          {/* This could be an image or dynamic content */}
          <span className="opacity-70">Visuals Here</span>
        </div>
      </div>

      {/* Bottom Section - Card-like container for auth options */}
      <div className="w-full max-w-md bg-white dark:bg-card rounded-t-3xl shadow-lg p-8 pb-12 text-foreground -mb-4">
        <h2 className="text-2xl font-bold mb-4">Start To Find Your Ideal Relationship</h2>
        <p className="text-muted-foreground mb-8">
          Create a unique emotional story that describes better than words
        </p>
        <div className="space-y-4">
          <Link to="/login"> {/* Link to your existing login page */}
            <Button className="w-full py-6 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md flex items-center justify-center">
              <Apple className="mr-2 h-6 w-6" /> Continue with Apple
            </Button>
          </Link>
          <Link to="/login"> {/* Link to your existing login page */}
            <Button className="w-full py-6 text-lg font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl shadow-md flex items-center justify-center border border-gray-300">
              <Chrome className="mr-2 h-6 w-6" /> Continue with Google
            </Button>
          </Link>
          <Link to="/login"> {/* Link to your existing login page */}
            <Button className="w-full py-6 text-lg font-semibold bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-xl shadow-md flex items-center justify-center">
              <Smartphone className="mr-2 h-6 w-6" /> Continue with Phone
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthOptionsPage;