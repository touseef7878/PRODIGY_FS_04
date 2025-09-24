"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-6">Welcome to Prochat!</h1>
      <p className="mb-8 text-lg text-center max-w-prose">
        This is your simplified Index page. You can navigate to other parts of your application using the links below.
      </p>
      <div className="flex space-x-4">
        <Link to="/chat">
          <Button variant="default">Go to Chat</Button>
        </Link>
        <Link to="/login">
          <Button variant="outline">Login / Signup</Button>
        </Link>
      </div>
    </div>
  );
};

export default Index;