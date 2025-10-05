"use client";


import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSession } from '@/components/SessionContextProvider';
import '@/prochat-welcome.css';

const Index: React.FC = () => {
  const { session, loginAsGuest } = useSession(); // Get session and loginAsGuest 
  const navigate = useNavigate();

  useEffect(() => {
    // If a session exists, redirect to the chat page
    if (session) {
      navigate('/chat');
    }
  }, [session, navigate]);

  const handleGuestLogin = React.useCallback(async () => {
    await loginAsGuest();
    navigate('/chat/guest');
  }, [loginAsGuest, navigate]);

  // If loading or already logged in (and redirecting), don't render anything yet
  if (session) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground relative overflow-hidden">
      {/* Animated Blobs */}
      <div className="prochat-blob prochat-blob1" />
      <div className="prochat-blob prochat-blob2" />
      <div className="prochat-blob prochat-blob3" />

      <main className="relative z-10 flex flex-col items-center justify-center w-full max-w-2xl px-6 py-16">
        <h1 className="prochat-hero text-6xl md:text-8xl font-black mb-4 leading-tight tracking-tight prochat-glow select-none drop-shadow-xl">
          Prochat
        </h1>
        <p className="text-2xl md:text-3xl font-light mb-7 animate-fade-in text-center max-w-2xl mx-auto opacity-95 drop-shadow-sm">
          <span className="font-semibold text-accent">Welcome!</span> Experience next-gen real-time chat with <span className="text-primary font-bold">Prochat</span>.<br/>
          <span className="text-muted-foreground">A <span className="text-accent font-bold">self-practice project</span> by Touseef.</span>
        </p>
        <div className="mb-12 animate-fade-in flex flex-col items-center gap-2">
          <span className="text-base md:text-lg text-muted-foreground flex items-center gap-2">
            <span className="inline-block animate-bounce">🚀</span> Lightning fast.
            <span className="inline-block animate-pulse">💬</span> Real-time.
            <span className="inline-block animate-spin-slow">🌗</span> Beautiful in dark & light.
          </span>
          <span className="text-base md:text-lg text-muted-foreground">Open source. Secure. Made with <span className="text-red-400">❤️</span> in Pakistan.</span>
        </div>
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-8 justify-center animate-fade-in">
          <Link to="/login">
            <button className="btn-accent text-lg px-10 py-4 shadow-2xl rounded-full font-semibold hover:scale-110 hover:shadow-accent transition-transform duration-200">
              Login
            </button>
          </Link>
          <Link to="/register">
            <button className="btn-accent-outline text-lg px-10 py-4 shadow-2xl rounded-full font-semibold hover:scale-110 hover:shadow-accent transition-transform duration-200">
              Sign Up
            </button>
          </Link>
        </div>
        
        {/* Guest button */}
        <div className="mt-6 animate-fade-in">
          <button 
            onClick={handleGuestLogin}
            className="btn-accent-outline text-lg px-10 py-4 shadow-2xl rounded-full font-semibold hover:scale-110 hover:shadow-accent transition-transform duration-200 opacity-80 hover:opacity-100"
          >
            Continue as Guest
          </button>
        </div>
        <div className="mt-16 text-center text-base md:text-lg text-muted-foreground animate-fade-in max-w-xl mx-auto">
          <p>
            <span className="font-semibold text-primary">Prochat</span> is a modern chat app built for speed, privacy, and fun.<br/>
            Designed & developed as a <span className="text-accent font-bold">self-practice project</span> by <span className="text-accent font-bold">Touseef</span>.<br/>
            <span className="italic text-sm text-muted-foreground">“Connect. Chat. Collaborate.”</span>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Index;