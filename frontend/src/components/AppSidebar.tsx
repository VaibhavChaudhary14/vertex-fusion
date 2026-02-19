import { useLocation, Link } from "wouter";
import {
  LayoutDashboard,
  FlaskConical,
  BookOpen,
  MessageSquareText,
  Newspaper,
  Database,
  User,
  Shield,
  LogOut,
  Cpu,
  Brain,
  Wrench,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const mainNavItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Virtual Lab",
    url: "/virtual-lab",
    icon: FlaskConical,
  },
  {
    title: "Knowledge Base",
    url: "/knowledge",
    icon: BookOpen,
  },
  {
    title: "AI Assistant",
    url: "/assistant",
    icon: MessageSquareText,
  },
];

const analyticsItems = [
  {
    title: "Threat Feed",
    url: "/threats",
    icon: Newspaper,
  },
  {
    title: "Datasets",
    url: "/datasets",
    icon: Database,
  },
];

const scientificItems = [
  {
    title: "ML Datasets & Models",
    url: "/ml-datasets",
    icon: Brain,
  },
  {
    title: "Backend Setup",
    url: "/backend-setup",
    icon: Cpu,
  },
  {
    title: "Python Utilities",
    url: "/python-utilities",
    icon: Wrench,
  },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  const isActive = (path: string) => location === path;

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b">
        <Link href="/dashboard" data-testid="link-logo">
          <div className="flex items-center gap-3 hover-elevate rounded-lg p-2 transition-all">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">Vertex Fusion</span>
              <span className="text-xs text-muted-foreground">ST-GNN Security</span>
            </div>
          </div>
        </Link>
      </SidebarHeader>
      
      <SidebarContent className="flex-1 overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                  >
                    <Link href={item.url} data-testid={`link-${item.title.toLowerCase().replace(' ', '-')}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Analytics & Data</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {analyticsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                  >
                    <Link href={item.url} data-testid={`link-${item.title.toLowerCase().replace(' ', '-')}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Scientific Rigor</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {scientificItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                  >
                    <Link href={item.url} data-testid={`link-${item.title.toLowerCase().replace(' ', '-')}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={location === "/profile"}>
              <Link href="/profile" data-testid="link-profile">
                <Avatar className="h-6 w-6">
                  <AvatarImage 
                    src={user?.profileImageUrl || undefined} 
                    alt={user?.firstName || "User"} 
                    className="object-cover"
                  />
                  <AvatarFallback className="text-xs">{getInitials()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm">
                    {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Profile'}
                  </span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {user?.role || 'Researcher'}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="/api/logout" data-testid="button-logout">
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
