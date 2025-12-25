"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Bell, Lock, CreditCard, Mail, Phone, MapPin, MessageSquare } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const [userData, setUserData] = useState<any>(null)
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    marketing: false,
  })
  const { toast } = useToast()

  useEffect(() => {
    const data = localStorage.getItem("onboardingData")
    if (data) {
      setUserData(JSON.parse(data))
    }
  }, [])

  const handleSaveProfile = () => {
    if (userData) {
      localStorage.setItem("onboardingData", JSON.stringify(userData))
      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully.",
      })
    }
  }

  const handleSaveNotifications = () => {
    toast({
      title: "Preferences saved",
      description: "Your notification preferences have been updated.",
    })
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account preferences and security</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Personal Information</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <div className="mt-2 flex items-center gap-2">
                    <User className="w-5 h-5 text-gray-400" />
                    <Input
                      id="name"
                      value={userData.name || ""}
                      onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <div className="mt-2 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={userData.email || ""}
                      onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="mt-2 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <Input
                      id="phone"
                      value={userData.phone || ""}
                      onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="city">City</Label>
                  <div className="mt-2 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <Input
                      id="city"
                      value={userData.city || ""}
                      onChange={(e) => setUserData({ ...userData, city: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-4">Financial Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="income">Monthly Income</Label>
                    <div className="mt-2 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-gray-400" />
                      <Input
                        id="income"
                        type="number"
                        value={userData.monthlyIncome || ""}
                        onChange={(e) => setUserData({ ...userData, monthlyIncome: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="emi">Existing EMI</Label>
                    <div className="mt-2 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-gray-400" />
                      <Input
                        id="emi"
                        type="number"
                        value={userData.existingEMI || ""}
                        onChange={(e) => setUserData({ ...userData, existingEMI: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} className="bg-emerald-600 hover:bg-emerald-700">
                  Save Changes
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Notification Preferences</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Email Notifications</h4>
                    <p className="text-sm text-gray-600">Receive loan updates via email</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900">SMS Notifications</h4>
                    <p className="text-sm text-gray-600">Get text messages for important updates</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.sms}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, sms: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Push Notifications</h4>
                    <p className="text-sm text-gray-600">Browser notifications for real-time alerts</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.push}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Marketing Emails</h4>
                    <p className="text-sm text-gray-600">Tips and offers from LoanSaathi</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.marketing}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, marketing: checked })}
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={async () => {
                    if (!userData?.phone) {
                      alert("No phone number found in profile.")
                      return
                    }
                    if (confirm(`Send test WhatsApp message to ${userData.phone}?`)) {
                      try {
                        const res = await fetch("/api/notify", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            stage: "profile_setup",
                            userData: { ...userData, name: "Test User" }
                          })
                        })
                        const data = await res.json()
                        if (data.success) {
                          alert("Success! Message sent. SID: " + data.sid)
                        } else {
                          alert("Failed: " + (data.error || JSON.stringify(data)))
                        }
                      } catch (e: any) {
                        alert("Error: " + e.message)
                      }
                    }
                  }}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Test WhatsApp
                </Button>

                <Button onClick={handleSaveNotifications} className="bg-emerald-600 hover:bg-emerald-700">
                  Save Preferences
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Security Settings</h3>
            <div className="space-y-6">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-5 h-5 text-emerald-600" />
                  <h4 className="font-semibold text-gray-900">Your account is secure</h4>
                </div>
                <p className="text-sm text-gray-700">Two-factor authentication is enabled</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Change Password</h4>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" className="mt-2" />
                  </div>
                  <div>
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" className="mt-2" />
                  </div>
                  <div>
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" className="mt-2" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button className="bg-emerald-600 hover:bg-emerald-700">Update Password</Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Privacy & Data</h3>
            <div className="space-y-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Data Usage</h4>
                <p className="text-sm text-gray-700 mb-3">
                  We use your data to provide personalized loan recommendations and improve our services. Your
                  information is encrypted and secure.
                </p>
                <Button variant="outline">Download My Data</Button>
              </div>

              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-semibold text-red-900 mb-2">Delete Account & Data</h4>
                <p className="text-sm text-red-700 mb-3">
                  This will PERMANENTLY delete all your data and log you out. This action cannot be undone.
                </p>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (confirm("Are you sure you want to reset?")) {
                      localStorage.removeItem("onboardingData")
                      localStorage.removeItem("loanProfile")
                      localStorage.removeItem("onboardingStep")
                      localStorage.removeItem("timelineSimulation")
                      localStorage.removeItem("uploadedFiles")
                      window.location.href = "/"
                    }
                  }}
                >
                  Reset & Logout
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
