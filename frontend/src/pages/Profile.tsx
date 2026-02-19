import { useAuth } from "@/hooks/useAuth";
import { UserProfile } from "@/components/UserProfile";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  const handleUpgrade = () => {
    toast({
      title: "Upgrade Request",
      description: "Contact sales@gridguardian.ai for enterprise pricing.",
    });
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start gap-6">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <Skeleton className="h-px w-full" />
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-2 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4">
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
          <p className="text-lg font-medium">Not Authenticated</p>
          <p className="text-sm">Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 h-full overflow-auto">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account settings and subscription
        </p>
      </div>

      <UserProfile user={user} onUpgrade={handleUpgrade} />
    </div>
  );
}
