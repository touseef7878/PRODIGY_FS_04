
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useSession } from '@/components/SessionContextProvider';
import '@/prochat-welcome.css';

const LoginPage: React.FC = () => {
  const { supabase, session } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      navigate('/'); // Redirect to home if already logged in
    }
  }, [session, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground relative overflow-hidden py-8">
      {/* Animated Blobs */}
      <div className="prochat-blob prochat-blob1" />
      <div className="prochat-blob prochat-blob2" />
      <div className="prochat-blob prochat-blob3" />

      <div className="relative z-10 w-full max-w-md mx-auto p-8 bg-card/80 rounded-2xl shadow-2xl backdrop-blur-md border border-border">
        <div className="text-center mb-8">
          <h2 className="prochat-hero text-4xl md:text-5xl font-extrabold mb-2 tracking-tight prochat-glow select-none">Prochat</h2>
          <p className="text-base md:text-lg text-muted-foreground mb-2 animate-fade-in">Welcome back! Log in to continue the conversation.</p>
        </div>
        <Auth
          supabaseClient={supabase}
          providers={[]}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: `hsl(170 80% 40%)`,
                  brandAccent: `hsl(0 0% 100%)`,
                  defaultButtonBackground: `hsl(170 80% 40%)`,
                  defaultButtonBackgroundHover: `hsl(170 80% 30%)`,
                  defaultButtonBorder: `hsl(170 80% 40%)`,
                  defaultButtonText: `hsl(0 0% 100%)`,
                  inputBackground: `hsl(var(--card))`,
                  inputBorder: `hsl(var(--border))`,
                  inputBorderHover: `hsl(var(--accent-primary))`,
                  inputBorderFocus: `hsl(var(--accent-primary))`,
                  inputText: `hsl(var(--foreground))`,
                  anchorTextColor: `hsl(var(--accent-primary))`,
                  anchorTextHoverColor: `hsl(170 80% 30%)`,
                },
                radii: {
                  buttonBorderRadius: '50px',
                  inputBorderRadius: '0.5rem',
                },
              },
            },
          }}
          theme="light"
          view="sign_in"
        />
      </div>
    </div>
  );
};

export default LoginPage;
