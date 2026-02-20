import { UserProfile } from "@/components/UserProfile";
import { useToast } from "@/hooks/use-toast";

// Static guest profile since auth has been removed
const GUEST_USER = {
  id: "guest",
  email: "researcher@vertexfusion.ai",
  firstName: "Research",
  lastName: "User",
  profileImageUrl: null,
  role: "researcher",
  createdAt: new Date().toISOString(),
};

export default function Profile() {
  const { toast } = useToast();

  const handleUpgrade = () => {
    toast({
      title: "Upgrade Request",
      description: "Contact sales@vertexfusion.ai for enterprise pricing.",
    });
  };

  return (
    <div className="p-4 h-full overflow-auto">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account settings and subscription
        </p>
      </div>
      <UserProfile user={GUEST_USER as any} onUpgrade={handleUpgrade} />
    </div>
  );
}
