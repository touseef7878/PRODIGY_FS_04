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
    <Card className="w-full max-w-md mx-auto shadow-lg border-border">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-foreground">Login</CardTitle>
      </CardHeader>
      <CardContent>
        <Auth
          supabaseClient={supabase}
          providers={[]} // No third-party providers for now
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: `hsl(var(--primary))`,
                  brandAccent: `hsl(var(--primary-foreground))`,
                  // Add more specific overrides for better control
                  defaultButtonBackground: `hsl(var(--primary))`,
                  defaultButtonBackgroundHover: `hsl(var(--primary) / 0.9)`,
                  defaultButtonBorder: `hsl(var(--border))`,
                  defaultButtonText: `hsl(var(--primary-foreground))`,
                  inputBackground: `hsl(var(--input))`,
                  inputBorder: `hsl(var(--border))`,
                  inputBorderHover: `hsl(var(--ring))`,
                  inputBorderFocus: `hsl(var(--ring))`,
                  inputText: `hsl(var(--foreground))`,
                  anchorTextColor: `hsl(var(--primary))`,
                  anchorTextHoverColor: `hsl(var(--primary) / 0.9)`,
                },
              },
            },
          }}
          theme="light" // Explicitly set to light theme
          view="sign_in" // Explicitly set to sign_in view
        />
      </CardContent>
    </Card>
  );
};

export default LoginPage;