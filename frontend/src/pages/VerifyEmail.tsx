import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function VerifyEmail() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");
      const email = params.get("email");

      if (!token || !email) {
        toast({
          title: "Error",
          description: "Invalid verification link",
          variant: "destructive",
        });
        setIsVerifying(false);
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify?token=${token}&email=${email}`);
        const data = await response.json();

        if (!response.ok) {
          toast({
            title: "Verification failed",
            description: data.message || "Could not verify your email",
            variant: "destructive",
          });
          setIsVerifying(false);
          return;
        }

        setIsSuccess(true);
        toast({
          title: "Success!",
          description: "Your email has been verified. Redirecting to login...",
        });

        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to verify email",
          variant: "destructive",
        });
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-background">
      <Card className="w-full max-w-md border-primary/30">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">Vertex Fusion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          {isVerifying ? (
            <div className="space-y-2">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="text-muted-foreground">Verifying your email...</p>
            </div>
          ) : isSuccess ? (
            <div className="space-y-2">
              <p className="text-green-600 dark:text-green-400 font-semibold">✓ Email verified!</p>
              <p className="text-sm text-muted-foreground">Redirecting to login...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Verification failed or link has expired</p>
              <Button onClick={() => navigate("/login")} className="w-full">
                Back to Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
