import { User as UserIcon, Mail, Shield, CreditCard, Activity, Settings, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User, SubscriptionTier, UserRole } from "@shared/schema";

interface UserProfileProps {
  user: User;
  onUpgrade?: () => void;
}

const tierColors: Record<SubscriptionTier, string> = {
  free: "bg-muted text-muted-foreground",
  professional: "bg-primary/10 text-primary",
  enterprise: "bg-warning/10 text-warning",
};

const tierLabels: Record<SubscriptionTier, string> = {
  free: "Free Tier",
  professional: "Professional",
  enterprise: "Enterprise",
};

const roleLabels: Record<UserRole, string> = {
  admin: "Administrator",
  analyst: "Cyber Analyst",
  researcher: "Academic Researcher",
};

export function UserProfile({ user, onUpgrade }: UserProfileProps) {
  const tier = (user.subscriptionTier as SubscriptionTier) || "free";
  const role = (user.role as UserRole) || "researcher";
  const apiUsagePercent = ((user.apiCallsUsed || 0) / (user.apiCallsLimit || 100)) * 100;

  const getInitials = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Unknown";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Profile Information</CardTitle>
          <CardDescription>Your account details and preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage
                src={user.profileImageUrl || undefined}
                alt={user.firstName || "User"}
                className="object-cover"
              />
              <AvatarFallback className="text-xl">{getInitials()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-semibold">
                  {user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user.email || "User"}
                </h2>
                <Badge className={tierColors[tier]}>{tierLabels[tier]}</Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {user.email || "No email"}
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  {roleLabels[role]}
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                Member since {formatDate(user.createdAt)}
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4" />
                API Usage
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Monthly Calls</span>
                  <span className="font-mono">
                    {user.apiCallsUsed?.toLocaleString() || 0} / {user.apiCallsLimit?.toLocaleString() || 100}
                  </span>
                </div>
                <Progress value={apiUsagePercent} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {apiUsagePercent >= 90
                    ? "You're approaching your limit. Consider upgrading."
                    : apiUsagePercent >= 70
                    ? "Good usage! You still have capacity remaining."
                    : "Plenty of API calls remaining this month."}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Subscription
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Current Plan</span>
                  <Badge variant="outline" className="capitalize">
                    {tierLabels[tier]}
                  </Badge>
                </div>
                {tier !== "enterprise" && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={onUpgrade}
                    data-testid="button-upgrade"
                  >
                    Upgrade Plan
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Account Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Button variant="outline" data-testid="button-edit-profile">
              <UserIcon className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
            <Button variant="outline" data-testid="button-security-settings">
              <Shield className="h-4 w-4 mr-2" />
              Security Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Plan Comparison</CardTitle>
          <CardDescription>
            Compare features across subscription tiers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {(["free", "professional", "enterprise"] as const).map((planTier) => (
              <div
                key={planTier}
                className={`rounded-lg border p-4 ${
                  tier === planTier ? "ring-2 ring-primary" : ""
                }`}
              >
                <div className="text-center mb-4">
                  <Badge className={tierColors[planTier]}>{tierLabels[planTier]}</Badge>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-success">✓</span>
                    {planTier === "free"
                      ? "100 API calls/month"
                      : planTier === "professional"
                      ? "10,000 API calls/month"
                      : "Unlimited API calls"}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-success">✓</span>
                    {planTier === "free"
                      ? "IEEE 14-bus only"
                      : planTier === "professional"
                      ? "IEEE 14 & 30-bus"
                      : "All topologies"}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={planTier === "free" ? "text-muted-foreground" : "text-success"}>
                      {planTier === "free" ? "✗" : "✓"}
                    </span>
                    <span className={planTier === "free" ? "text-muted-foreground" : ""}>
                      Dataset Export
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={planTier !== "enterprise" ? "text-muted-foreground" : "text-success"}>
                      {planTier !== "enterprise" ? "✗" : "✓"}
                    </span>
                    <span className={planTier !== "enterprise" ? "text-muted-foreground" : ""}>
                      Priority Support
                    </span>
                  </li>
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
