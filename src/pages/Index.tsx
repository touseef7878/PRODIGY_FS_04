"use client";

import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useSession } from '@/components/SessionContextProvider'; // Import useSession

const Index: React.FC = () => {
  const { session } = useSession(); // Get session
  const navigate = useNavigate();

  useEffect(() => {
    // If a session exists, redirect to the chat page
    if (session) {
      navigate('/chat');
    }
  }, [session, navigate]);

  // If loading or already logged in (and redirecting), don't render anything yet
  if (session) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-6">Welcome to Prochat!</h1>
      <p className="mb-8 text-lg text-center max-w-prose">
        Please log in or sign up to start chatting.
      </p>
      <div className="flex space-x-4">
        <Link to="/login">
          <Button variant="default">Login</Button>
        </Link>
        <Link to="/register">
          <Button variant="outline">Sign Up</Button>
        </Link>
      </div>
    </div>
  );
};

export default Index;