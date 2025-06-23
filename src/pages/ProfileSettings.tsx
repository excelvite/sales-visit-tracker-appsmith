
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { updateUserProfile } from "@/services/mockDataService";
import { User, Settings } from "lucide-react";

const ProfileSettings = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpdateProfile = async () => {
    if (!currentUser) return;

    setIsLoading(true);

    try {
      // Validate form
      if (!formData.name.trim()) {
        toast({
          title: "Error",
          description: "Name is required.",
          variant: "destructive",
        });
        return;
      }

      if (!formData.email.trim()) {
        toast({
          title: "Error",
          description: "Email is required.",
          variant: "destructive",
        });
        return;
      }

      // If changing password, validate current password and new password match
      if (formData.newPassword) {
        if (!formData.currentPassword) {
          toast({
            title: "Error",
            description: "Current password is required to change password.",
            variant: "destructive",
          });
          return;
        }

        if (formData.currentPassword !== currentUser.password) {
          toast({
            title: "Error",
            description: "Current password is incorrect.",
            variant: "destructive",
          });
          return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
          toast({
            title: "Error",
            description: "New passwords do not match.",
            variant: "destructive",
          });
          return;
        }

        if (formData.newPassword.length < 6) {
          toast({
            title: "Error",
            description: "New password must be at least 6 characters long.",
            variant: "destructive",
          });
          return;
        }
      }

      // Update user profile
      const updates: any = {
        name: formData.name.trim(),
        email: formData.email.trim(),
      };

      if (formData.newPassword) {
        updates.password = formData.newPassword;
      }

      const success = updateUserProfile(currentUser.id, updates);

      if (success) {
        // Update localStorage currentUser
        const updatedUser = { ...currentUser, ...updates };
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));

        toast({
          title: "Profile updated",
          description: "Your profile has been successfully updated.",
        });

        // Clear password fields
        setFormData(prev => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      } else {
        toast({
          title: "Error",
          description: "Failed to update profile. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Please log in to access profile settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6" />
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
      </div>
      <p className="text-muted-foreground">
        Manage your account settings and preferences.
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
          <CardDescription>
            Update your personal details and account information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter your full name"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="Enter your email address"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="role">Role</Label>
            <Input
              id="role"
              value={currentUser.role}
              disabled
              className="bg-muted"
            />
            <p className="text-sm text-muted-foreground">
              Your role cannot be changed. Contact an administrator if you need role changes.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your password to keep your account secure. Leave blank if you don't want to change it.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={formData.currentPassword}
              onChange={(e) => handleInputChange("currentPassword", e.target.value)}
              placeholder="Enter your current password"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={(e) => handleInputChange("newPassword", e.target.value)}
              placeholder="Enter your new password"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
              placeholder="Confirm your new password"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={handleUpdateProfile} 
          disabled={isLoading}
          className="bg-sales-blue hover:bg-blue-800"
        >
          {isLoading ? "Updating..." : "Update Profile"}
        </Button>
      </div>
    </div>
  );
};

export default ProfileSettings;
