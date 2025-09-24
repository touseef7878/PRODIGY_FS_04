"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

const AuthFrontPage: React.FC = () => {
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

      {/* Bottom Section - Card-like container */}
      <div className="w-full max-w-md bg-white dark:bg-card rounded-t-3xl shadow-lg p-8 pb-12 text-foreground -mb-4">
        <h2 className="text-3xl font-bold mb-4">Your ideal match, Your ideal relationship.</h2>
        <p className="text-muted-foreground mb-8">
          Create a unique emotional story that describes better than words
        </p>
        <Link to="/auth-options">
          <Button className="w-full py-6 text-lg font-semibold bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-xl shadow-md">
            Get Started <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default AuthFrontPage;