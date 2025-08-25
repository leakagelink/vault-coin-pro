
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Lock } from "lucide-react";

const AdminSecurityTab: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const onChangePassword = async () => {
    if (!password || !confirm) {
      toast({ title: "Please fill both fields" });
      return;
    }
    if (password !== confirm) {
      toast({ title: "Passwords do not match" });
      return;
    }
    setLoading(true);
    console.log("[AdminSecurity] Updating password");
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      console.error("[AdminSecurity] Password update error:", error);
      toast({ title: "Failed to update password" });
      return;
    }
    setPassword("");
    setConfirm("");
    toast({ title: "Password updated successfully" });
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary" />
          Security
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="newPass">New password</Label>
          <Input
            id="newPass"
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-9"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="confirmPass">Confirm password</Label>
          <Input
            id="confirmPass"
            type="password"
            placeholder="Re-enter new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="h-9"
          />
        </div>
        <div className="flex justify-end">
          <Button onClick={onChangePassword} disabled={loading}>
            {loading ? "Updating..." : "Change Password"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminSecurityTab;
