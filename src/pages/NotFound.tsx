
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/50">
      <div className="text-center max-w-md mx-auto p-6">
        <h1 className="text-6xl font-bold text-sales-blue mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-6">Oops! This page doesn't exist.</p>
        <Button 
          onClick={() => navigate("/")}
          className="bg-sales-blue hover:bg-blue-800"
        >
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
