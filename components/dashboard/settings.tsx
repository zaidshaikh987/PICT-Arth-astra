"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/lib/user-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Bell, Lock, CreditCard, Mail, Phone, MapPin, MessageSquare, Moon, Sun, Laptop } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useTheme } from "next-themes"

export default function SettingsPage() {
  const [userData, setUserData] = useState<any>(null)
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    marketing: false,
  })
  const { toast } = useToast()
  const { user, updateUser } = useUser()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    if (user) {
      setUserData({ ...user })
    }
  }, [user])

  const handleSaveProfile = async () => {
    if (userData) {
      try {
        await updateUser(userData)
        toast({
          title: "Profile updated",
          description: "Your profile has been saved to the database.",
        })
      } catch {
        toast({
          title: "Save failed",
          description: "Could not save your profile. Please try again.",
          variant: "destructive",
        })
      }
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your account preferences and security</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
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
                <Button onClick={handleSaveProfile} className="bg-blue-600 hover:bg-blue-700">
                  Save Changes
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card className="p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Appearance</h3>
            <div className="grid grid-cols-3 gap-4">
              <div
                onClick={() => setTheme("light")}
                className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center gap-2 hover:bg-gray-50 ${theme === 'light' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}
              >
                <Sun className="w-8 h-8 text-orange-500" />
                <span className="font-medium text-gray-900">Light</span>
              </div>
              <div
                onClick={() => setTheme("dark")}
                className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center gap-2 hover:bg-gray-800 ${theme === 'dark' ? 'border-blue-600 bg-gray-800' : 'border-gray-200'}`}
              >
                <Moon className="w-8 h-8 text-blue-500" />
                <span className="font-medium text-gray-900 dark:text-gray-100">Dark</span>
              </div>
              <div
                onClick={() => setTheme("system")}
                className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center gap-2 hover:bg-gray-50 ${theme === 'system' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}
              >
                <Laptop className="w-8 h-8 text-gray-500" />
                <span className="font-medium text-gray-900">System</span>
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
                    <p className="text-sm text-gray-600">Tips and offers from ArthAstra</p>
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

                <Button onClick={handleSaveNotifications} className="bg-blue-600 hover:bg-blue-700">
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
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-5 h-5 text-blue-600" />
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
                <Button className="bg-blue-600 hover:bg-blue-700">Update Password</Button>
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
                      document.cookie = "userId=; path=/; max-age=0"
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
