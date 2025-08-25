
import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { CreditCard, Smartphone, Building2, QrCode } from "lucide-react";
import { adminApi } from "@/services/adminService";

const AdminPaymentSettings: React.FC = () => {
  const [upiId, setUpiId] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [accountHolder, setAccountHolder] = useState("");

  const queryClient = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: ["admin", "payment_settings"],
    queryFn: adminApi.fetchPaymentSettings,
  });

  useEffect(() => {
    if (settings) {
      setUpiId(settings.upi_id || "");
      setQrCodeUrl(settings.qr_code_url || "");
      setBankName(settings.bank_name || "");
      setAccountNumber(settings.account_number || "");
      setIfscCode(settings.ifsc_code || "");
      setAccountHolder(settings.account_holder || "");
    }
  }, [settings]);

  const updateSettings = useMutation({
    mutationFn: (data: any) => adminApi.updatePaymentSettings(data),
    onSuccess: () => {
      toast({ title: "Payment settings updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["admin", "payment_settings"] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleSave = () => {
    updateSettings.mutate({
      upi_id: upiId,
      qr_code_url: qrCodeUrl,
      bank_name: bankName,
      account_number: accountNumber,
      ifsc_code: ifscCode,
      account_holder: accountHolder,
    });
  };

  return (
    <div className="space-y-6">
      {/* UPI Settings */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            UPI Payment Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="upiId">UPI ID</Label>
            <Input
              id="upiId"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="your-upi@provider"
            />
          </div>
        </CardContent>
      </Card>

      {/* QR Code Settings */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            QR Code Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="qrCodeUrl">QR Code Image URL</Label>
            <Input
              id="qrCodeUrl"
              value={qrCodeUrl}
              onChange={(e) => setQrCodeUrl(e.target.value)}
              placeholder="https://example.com/qr-code.png"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Upload QR code image to an image hosting service and paste the URL here
            </p>
          </div>
          {qrCodeUrl && (
            <div>
              <Label>QR Code Preview</Label>
              <div className="mt-2">
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code" 
                  className="w-32 h-32 border rounded"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bank Details Settings */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Bank Account Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="bankName">Bank Name</Label>
            <Input
              id="bankName"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="State Bank of India"
            />
          </div>
          <div>
            <Label htmlFor="accountHolder">Account Holder Name</Label>
            <Input
              id="accountHolder"
              value={accountHolder}
              onChange={(e) => setAccountHolder(e.target.value)}
              placeholder="Account holder full name"
            />
          </div>
          <div>
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input
              id="accountNumber"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="1234567890"
            />
          </div>
          <div>
            <Label htmlFor="ifscCode">IFSC Code</Label>
            <Input
              id="ifscCode"
              value={ifscCode}
              onChange={(e) => setIfscCode(e.target.value)}
              placeholder="SBIN0001234"
            />
          </div>
        </CardContent>
      </Card>

      <Button 
        onClick={handleSave} 
        disabled={updateSettings.isPending}
        className="w-full"
      >
        {updateSettings.isPending ? "Saving..." : "Save Payment Settings"}
      </Button>
    </div>
  );
};

export default AdminPaymentSettings;
