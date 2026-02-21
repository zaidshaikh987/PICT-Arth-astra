import DashboardLayout from "@/components/dashboard/dashboard-layout"
import AIChat from "@/components/dashboard/ai-chat"

export const metadata = {
  title: "AI Assistant - ArthAstra",
  description: "Chat with your AI loan advisor",
}

export default function ChatPage() {
  return (
    <DashboardLayout>
      <AIChat />
    </DashboardLayout>
  )
}
