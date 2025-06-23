
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/types";
import { getRegisteredUsers, resetUserPassword } from "@/services/mockDataService";
import { useToast } from "@/hooks/use-toast";
import { RotateCcw } from "lucide-react";

export function Team() {
  const { currentUser } = useAuth();
  const { toast } = useToast();

  // Only admin should access this page
  if (currentUser?.role !== UserRole.ADMIN) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground mt-2">You don't have permission to view this page.</p>
      </div>
    );
  }

  const registeredUsers = getRegisteredUsers();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return <Badge className="bg-sales-blue text-white">Administrator</Badge>;
      case UserRole.SALES:
        return <Badge className="bg-sales-green text-white">Sales Representative</Badge>;
      case UserRole.MANAGEMENT:
        return <Badge className="bg-sales-amber text-white">Management</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const handleResetPassword = (userId: string) => {
    resetUserPassword(userId);
    toast({
      title: "Password Reset",
      description: "A temporary password has been sent to the user's email.",
    });
  };

  // Group users by role
  const admins = registeredUsers.filter(user => user.role === UserRole.ADMIN);
  const salesReps = registeredUsers.filter(user => user.role === UserRole.SALES);
  const managers = registeredUsers.filter(user => user.role === UserRole.MANAGEMENT);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Team</h1>
        <p className="text-muted-foreground">
          Manage your team members and their permissions
        </p>
      </div>
      
      {/* Admin Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Administration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {admins.map((member) => (
            <Card key={member.id} className="overflow-hidden">
              <CardHeader className="bg-muted/30 pb-2">
                <div className="flex justify-between items-start">
                  <Avatar className="h-12 w-12 border-2 border-white">
                    <AvatarFallback className="bg-sales-blue text-white">
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  {getRoleBadge(member.role)}
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <CardTitle className="text-lg mb-1">{member.name}</CardTitle>
                <p className="text-sm text-muted-foreground mb-3">{member.email}</p>
                <div className="text-xs text-muted-foreground mb-3">
                  Joined {new Date(member.joinDate).toLocaleDateString()}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleResetPassword(member.id)}
                  className="w-full"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Password
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Sales Representatives Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Sales Representatives</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {salesReps.map((member) => (
            <Card key={member.id} className="overflow-hidden">
              <CardHeader className="bg-muted/30 pb-2">
                <div className="flex justify-between items-start">
                  <Avatar className="h-12 w-12 border-2 border-white">
                    <AvatarFallback className="bg-sales-green text-white">
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  {getRoleBadge(member.role)}
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <CardTitle className="text-lg mb-1">{member.name}</CardTitle>
                <p className="text-sm text-muted-foreground mb-3">{member.email}</p>
                <div className="text-xs text-muted-foreground mb-3">
                  Joined {new Date(member.joinDate).toLocaleDateString()}
                </div>
                
                <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-2 mb-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-sales-blue">0</div>
                    <div className="text-xs text-muted-foreground">Total Visits</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-sales-green">0</div>
                    <div className="text-xs text-muted-foreground">New Accounts</div>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleResetPassword(member.id)}
                  className="w-full"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Password
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Management Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {managers.map((member) => (
            <Card key={member.id} className="overflow-hidden">
              <CardHeader className="bg-muted/30 pb-2">
                <div className="flex justify-between items-start">
                  <Avatar className="h-12 w-12 border-2 border-white">
                    <AvatarFallback className="bg-sales-amber text-white">
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  {getRoleBadge(member.role)}
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <CardTitle className="text-lg mb-1">{member.name}</CardTitle>
                <p className="text-sm text-muted-foreground mb-3">{member.email}</p>
                <div className="text-xs text-muted-foreground mb-3">
                  Joined {new Date(member.joinDate).toLocaleDateString()}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleResetPassword(member.id)}
                  className="w-full"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Password
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Team;
