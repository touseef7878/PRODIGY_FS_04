import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSession } from '@/components/SessionContextProvider'; // Import useSession

const LoginPage: React.FC = () => {
  const { supabase, session } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      navigate('/'); // Redirect to home if already logged in
    }
  }, [session, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center welcome-bg p-4">
      <div className="form-card w-full max-w-md mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">Login</h2>
        </div>
        <Auth
          supabaseClient={supabase}
          providers={[]} // No third-party providers for now
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: `hsl(170 80% 40%)`, // Teal/green accent
                  brandAccent: `hsl(0 0% 100%)`, // White text on brand buttons
                  defaultButtonBackground: `hsl(170 80% 40%)`,
                  defaultButtonBackgroundHover: `hsl(170 80% 30%)`, // Slightly darker teal on hover
                  defaultButtonBorder: `hsl(170 80% 40%)`,
                  defaultButtonText: `hsl(0 0% 100%)`,
                  inputBackground: `hsl(var(--background))`, // Use theme background
                  inputBorder: `hsl(var(--border))`, // Use theme border
                  inputBorderHover: `hsl(var(--accent-primary))`, // Use theme accent on hover
                  inputBorderFocus: `hsl(var(--accent-primary))`, // Use theme accent on focus
                  inputText: `hsl(var(--foreground))`, // Use theme text
                  anchorTextColor: `hsl(var(--accent-primary))`, // Theme accent for links
                  anchorTextHoverColor: `hsl(170 80% 30%)`, // Slightly darker accent on link hover
                },
                radii: {
                  button: '50px', // Pill-shaped buttons
                  input: '0.5rem', // Rounded inputs
                  card: '1rem', // Rounded cards
                },
              },
            },
          }}
          theme="light" // Explicitly set to light theme
          view="sign_in" // Explicitly set to sign_in view
        />
      </div>
    </div>
  );
};

export default LoginPage;