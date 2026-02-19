import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Shield, ArrowLeft, Eye, EyeOff, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain uppercase letter")
  .regex(/[a-z]/, "Password must contain lowercase letter")
  .regex(/\d/, "Password must contain number")
  .regex(/[!@#$%^&*]/, "Password must contain special character (!@#$%^&*)");

const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [, navigate] = useLocation();

  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  const email = params.get("email");

  useEffect(() => {
    const validateToken = async () => {
      if (!token || !email) {
        setIsValidating(false);
        return;
      }

      try {
        const response = await fetch(`/api/auth/validate-reset-token?token=${token}&email=${email}`);
        if (response.ok) {
          setIsTokenValid(true);
        }
      } catch (error) {
        console.error("Token validation error:", error);
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token, email]);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const passwordRequirements = [
    { label: "8+ characters", regex: /.{8,}/ },
    { label: "Uppercase letter", regex: /[A-Z]/ },
    { label: "Lowercase letter", regex: /[a-z]/ },
    { label: "Number", regex: /\d/ },
    { label: "Special character (!@#$%^&*)", regex: /[!@#$%^&*]/ },
  ];

  const checkRequirement = (regex: RegExp) => regex.test(password);

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          email,
          password: data.password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to reset password",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success!",
        description: "Your password has been reset. Redirecting to login...",
      });

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Validating reset link...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isTokenValid) {
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
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-primary/30 bg-gradient-to-br from-background/80 via-primary/5 to-background/80">
            <CardContent className="pt-6 space-y-4 text-center">
              <p className="text-sm text-red-500 font-semibold">Invalid or Expired Link</p>
              <p className="text-sm text-muted-foreground">
                This password reset link has expired or is invalid. Please request a new one.
              </p>
              <Link href="/forgot-password">
                <Button className="w-full">Request New Reset Link</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-primary/30 bg-gradient-to-br from-background/80 via-primary/5 to-background/80">
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              <Link href="/login">
                <Button variant="ghost" size="sm" className="p-0 h-auto font-normal text-muted-foreground hover:text-foreground">
                  Back to login
                </Button>
              </Link>
            </div>
            <CardTitle className="text-2xl">Create New Password</CardTitle>
            <CardDescription>Enter a strong password to reset your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="••••••••"
                            type={showPassword ? "text" : "password"}
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              setPassword(e.target.value);
                            }}
                            data-testid="input-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {password && (
                  <div className="space-y-2 p-3 bg-muted/50 rounded-md">
                    <p className="text-xs font-semibold text-muted-foreground">Password requirements:</p>
                    <div className="space-y-1">
                      {passwordRequirements.map((req, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          {checkRequirement(req.regex) ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-red-500" />
                          )}
                          <span className={checkRequirement(req.regex) ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>
                            {req.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="••••••••"
                            type={showConfirmPassword ? "text" : "password"}
                            {...field}
                            data-testid="input-confirm-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                  data-testid="button-reset-password"
                >
                  {isLoading ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
