import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MadeWithDyad } from "@/components/made-with-dyad";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-6">Welcome to your Dyad App!</h1>
      <p className="mb-8 text-lg text-center max-w-prose">
        This is your simplified Index page. You can navigate to other parts of your application using the links below.
      </p>
      <div className="flex flex-col space-y-4">
        <Link to="/login">
          <Button className="w-48">Go to Login</Button>
        </Link>
        <Link to="/register">
          <Button className="w-48">Go to Register</Button>
        </Link>
        <Link to="/chat">
          <Button className="w-48">Go to Chat</Button>
        </Link>
      </div>
      <div className="mt-auto">
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default Index;