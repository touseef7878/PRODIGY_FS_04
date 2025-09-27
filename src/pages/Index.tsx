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
    <div className="min-h-screen flex flex-col items-center justify-center auth-page text-white p-4 relative overflow-hidden">
      {/* Background elements for aesthetic */}
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
        <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-pink-400 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 text-center max-w-3xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight tracking-tight">
          Welcome to <span className="text-yellow-300 drop-shadow-lg">Prochat!</span>
        </h1>
        <p className="mb-10 text-xl md:text-2xl font-light opacity-90">
          Task 4 for Prodigy Infotec - Built by Touseef. Functional chat application with real-time messaging.
        </p>
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 justify-center">
          <Link to="/login">
            <button className="btn-accent text-lg px-8 py-4">
              Login
            </button>
          </Link>
          <Link to="/register">
            <button className="btn-accent-outline text-lg px-8 py-4">
              Sign Up
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;