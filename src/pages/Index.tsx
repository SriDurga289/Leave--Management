import AnalyticsCards from "@/components/AnalyticsCards";
import LeaveForm from "@/components/LeaveForm";
import LeaveTable from "@/components/LeaveTable";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { CalendarDays, LogOut } from "lucide-react";

const Index = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary text-primary-foreground">
              <CalendarDays className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold text-card-foreground">Leave Management System</h1>
          </div>
          <div className="flex items-center gap-3">
            <LeaveForm />
            <span className="text-sm text-muted-foreground hidden sm:inline">{user?.email}</span>
            <Button variant="outline" size="icon" onClick={signOut} title="Sign out">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8 space-y-8">
        <AnalyticsCards />
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Leave Requests</h2>
          <LeaveTable />
        </div>
      </main>
    </div>
  );
};

export default Index;
