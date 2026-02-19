import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Mail, Loader2 } from "lucide-react";
import { useState } from "react";

interface CheckEmailProps {
  email?: string;
}

export default function CheckEmail({ email = "your email" }: CheckEmailProps) {
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleResendEmail = async () => {
    setIsResending(true);
    setResendMessage(null);

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setResendMessage({
          type: "success",
          text: "✅ Verification email sent! Check your inbox and spam folder.",
        });
      } else {
        setResendMessage({
          type: "error",
          text: data.message || "Failed to resend email. Please try again.",
        });
      }
    } catch (error) {
      console.error("Resend error:", error);
      setResendMessage({
        type: "error",
        text: "An error occurred. Please try again later.",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-primary/5 to-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-7xl mx-auto flex items-center justify-between h-16 px-4">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg">Vertex Fusion</span>
            </div>
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-primary/30 bg-gradient-to-br from-background/80 via-primary/5 to-background/80">
          <CardHeader className="space-y-2 text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-500/20">
                <Mail className="h-6 w-6 text-blue-400" />
              </div>
            </div>
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
            <CardDescription>Verify your account to get started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-center">
              <p className="text-sm text-muted-foreground">
                We've sent a verification link to <span className="font-semibold text-foreground">{email}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Click the link in the email to verify your account and complete signup.
              </p>
            </div>

            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-md">
              <p className="text-xs text-blue-400">
                💡 Tip: Check your spam folder if you don't see the email
              </p>
            </div>

            {resendMessage && (
              <div className={`p-3 rounded-md border ${
                resendMessage.type === "success"
                  ? "bg-green-500/10 border-green-500/20 text-green-400"
                  : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}>
                <p className="text-xs">{resendMessage.text}</p>
              </div>
            )}

            <div className="space-y-2 pt-2">
              <Button
                onClick={handleResendEmail}
                disabled={isResending}
                className="w-full bg-blue-500 hover:bg-blue-600"
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resending...
                  </>
                ) : (
                  "📧 Resend Verification Email"
                )}
              </Button>
              <Link href="/login">
                <Button variant="outline" className="w-full">
                  Back to Login
                </Button>
              </Link>
              <p className="text-xs text-center text-muted-foreground">
                Already verified? <Link href="/login"><Button variant="ghost" size="sm" className="p-0 h-auto text-blue-400 hover:text-blue-300">Sign in here</Button></Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
