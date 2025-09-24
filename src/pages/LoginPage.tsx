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
    console.log("[LoginPage] Current session:", session); // Add this line
    if (session) {
      navigate('/'); // Redirect to home if already logged in
    }
  }, [session, navigate]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Login</CardTitle>
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
                  brand: 'hsl(var(--primary))',
                  brandAccent: 'hsl(var(--primary-foreground))',
                },
              },
            },
          }}
          theme="light"
          view="sign_in" // Explicitly set to sign_in view
        />
      </CardContent>
    </Card>
  );
};

export default LoginPage;