import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SiGoogle } from "react-icons/si";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Shield, ArrowLeft, Eye, EyeOff, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain uppercase letter")
  .regex(/[a-z]/, "Password must contain lowercase letter")
  .regex(/\d/, "Password must contain number")
  .regex(/[!@#$%^&*]/, "Password must contain special character (!@#$%^&*)");

const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

export default function SignUp() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const passwordRequirements = [
    { label: "8+ characters", regex: /.{8,}/ },
    { label: "Uppercase letter", regex: /[A-Z]/ },
    { label: "Lowercase letter", regex: /[a-z]/ },
    { label: "Number", regex: /\d/ },
    { label: "Special character (!@#$%^&*)", regex: /[!@#$%^&*]/ },
  ];

  const checkRequirement = (regex: RegExp) => regex.test(password);

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: SignUpFormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        toast({
          title: "Sign up failed",
          description: error.message || "Please try again",
          variant: "destructive",
        });
        return;
      }

      const result = await response.json();

      // Invalidate auth query to refresh user state
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });

      toast({
        title: "Welcome!",
        description: "Account created successfully. Redirecting...",
      });

      // No need to store email for check email page anymore
      // sessionStorage.setItem("signupEmail", data.email);

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 500);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
              <Link href="/">
                <Button variant="ghost" size="sm" className="p-0 h-auto font-normal text-muted-foreground hover:text-foreground">
                  Back to home
                </Button>
              </Link>
            </div>
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <CardDescription>Join Vertex Fusion for advanced grid security</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} data-testid="input-firstname" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} data-testid="input-lastname" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Email</FormLabel>
                      <FormControl>
                        <Input placeholder="john@example.com" type="email" {...field} data-testid="input-email" />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Password</FormLabel>
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

                <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-create-account">
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </Form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <a href="/api/auth/google">
              <Button variant="outline" className="w-full" data-testid="button-signup-google">
                <SiGoogle className="h-4 w-4 mr-2" />
                Sign up with Google
              </Button>
            </a>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login">
                <Button variant="ghost" className="w-full" disabled={isLoading}>
                  Login
                </Button>
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
