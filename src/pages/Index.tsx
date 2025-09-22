import { MadeWithDyad } from "@/components/made-with-dyad";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Your Chat App</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Connect and chat with your friends!
        </p>
        <div className="space-x-4">
          <Button asChild>
            <Link to="/login">Login</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/register">Register</Link>
          </Button>
          <Button asChild>
            <Link to="/chat">Go to Chat</Link> {/* Added link to chat page */}
          </Button>
        </div>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Index;