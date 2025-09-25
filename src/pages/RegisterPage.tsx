import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSession } from '@/components/SessionContextProvider'; // Import useSession

const RegisterPage: React.FC = () => {
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
        <CardTitle className="text-2xl text-foreground">Register</CardTitle>
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
                  brand: `hsl(217 91% 59%)`, // A vibrant blue for main buttons
                  brandAccent: `hsl(0 0% 100%)`, // White text on brand buttons
                  defaultButtonBackground: `hsl(217 91% 59%)`,
                  defaultButtonBackgroundHover: `hsl(217 91% 49%)`, // Slightly darker blue on hover
                  defaultButtonBorder: `hsl(217 91% 59%)`,
                  defaultButtonText: `hsl(0 0% 100%)`,
                  inputBackground: `hsl(0 0% 100%)`, // White input background
                  inputBorder: `hsl(214.3 31.8% 91.4%)`, // Light gray border
                  inputBorderHover: `hsl(222.2 84% 4.9%)`, // Darker border on hover
                  inputBorderFocus: `hsl(222.2 84% 4.9%)`, // Darker border on focus
                  inputText: `hsl(222.2 47.4% 11.2%)`, // Dark text
                  anchorTextColor: `hsl(217 91% 59%)`, // Vibrant blue for links
                  anchorTextHoverColor: `hsl(217 91% 49%)`, // Slightly darker blue on link hover
                },
              },
            },
          }}
          theme="light" // Explicitly set to light theme
          view="sign_up" // Explicitly set to sign_up view
        />
      </CardContent>
    </Card>
  );
};

export default RegisterPage;