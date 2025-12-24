import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Switch } from '../../components/ui/switch';
import { Textarea } from '../../components/ui/textarea';
import { settingsAPI } from '../../lib/api';
import { toast } from 'sonner';
import { Save, Building2 } from 'lucide-react';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    business_name: '',
    gst_number: '',
    phone: '',
    email: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      pincode: '',
    },
    enable_gst_billing: true,
    default_gst_rate: '18',
    invoice_prefix: 'INV',
    order_prefix: 'ORD',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await settingsAPI.get();
      if (response.data) {
        setSettings({
          ...settings,
          ...response.data,
          address: { ...settings.address, ...response.data.address },
        });
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsAPI.update({
        ...settings,
        default_gst_rate: parseFloat(settings.default_gst_rate),
      });
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleAddressChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      address: { ...prev.address, [field]: value },
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-800 rounded animate-pulse" />
        <div className="h-64 bg-slate-800 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="admin-settings">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-slate-400">Configure your store settings</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90">
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Business Details */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Business Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Business Name</Label>
              <Input
                value={settings.business_name}
                onChange={(e) => setSettings({ ...settings, business_name: e.target.value })}
                placeholder="Your Business Name"
                className="input-admin"
              />
            </div>
            <div className="space-y-2">
              <Label>GST Number</Label>
              <Input
                value={settings.gst_number}
                onChange={(e) => setSettings({ ...settings, gst_number: e.target.value.toUpperCase() })}
                placeholder="e.g., 29ABCDE1234F1Z5"
                className="input-admin"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  placeholder="+91 9876543210"
                  className="input-admin"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  placeholder="business@example.com"
                  className="input-admin"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle>Business Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Address Line 1</Label>
              <Input
                value={settings.address.line1}
                onChange={(e) => handleAddressChange('line1', e.target.value)}
                placeholder="Building, Street"
                className="input-admin"
              />
            </div>
            <div className="space-y-2">
              <Label>Address Line 2</Label>
              <Input
                value={settings.address.line2}
                onChange={(e) => handleAddressChange('line2', e.target.value)}
                placeholder="Area, Landmark"
                className="input-admin"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>City</Label>
                <Input
                  value={settings.address.city}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                  placeholder="City"
                  className="input-admin"
                />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input
                  value={settings.address.state}
                  onChange={(e) => handleAddressChange('state', e.target.value)}
                  placeholder="State"
                  className="input-admin"
                />
              </div>
              <div className="space-y-2">
                <Label>Pincode</Label>
                <Input
                  value={settings.address.pincode}
                  onChange={(e) => handleAddressChange('pincode', e.target.value)}
                  placeholder="Pincode"
                  className="input-admin"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Billing Settings */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle>Billing & Invoice Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Enable GST Billing</Label>
                <p className="text-sm text-slate-400">Show GST breakdown on invoices</p>
              </div>
              <Switch
                checked={settings.enable_gst_billing}
                onCheckedChange={(checked) => setSettings({ ...settings, enable_gst_billing: checked })}
              />
            </div>
            <div className="space-y-2">
              <Label>Default GST Rate (%)</Label>
              <Input
                type="number"
                value={settings.default_gst_rate}
                onChange={(e) => setSettings({ ...settings, default_gst_rate: e.target.value })}
                placeholder="18"
                className="input-admin"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Invoice Prefix</Label>
                <Input
                  value={settings.invoice_prefix}
                  onChange={(e) => setSettings({ ...settings, invoice_prefix: e.target.value.toUpperCase() })}
                  placeholder="INV"
                  className="input-admin"
                />
              </div>
              <div className="space-y-2">
                <Label>Order Prefix</Label>
                <Input
                  value={settings.order_prefix}
                  onChange={(e) => setSettings({ ...settings, order_prefix: e.target.value.toUpperCase() })}
                  placeholder="ORD"
                  className="input-admin"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
