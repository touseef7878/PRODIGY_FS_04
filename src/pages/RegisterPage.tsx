import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
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
    <div className="w-full max-w-md p-8 bg-white rounded-xl shadow dark:bg-gray-900">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">Register</h2>
        </div>
        <Auth
          supabaseClient={supabase}
          providers={[]}
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
                  inputBackground: `hsl(var(--card))`,
                  inputBorder: `hsl(var(--border))`,
                  inputBorderHover: `hsl(var(--accent-primary))`,
                  inputBorderFocus: `hsl(var(--accent-primary))`,
                  inputText: `hsl(var(--foreground))`,
                  anchorTextColor: `hsl(var(--accent-primary))`,
                  anchorTextHoverColor: `hsl(170 80% 30%)`,
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
          view="sign_up" // Explicitly set to sign_up view
        />
      </div>
  );
};

export default RegisterPage;
