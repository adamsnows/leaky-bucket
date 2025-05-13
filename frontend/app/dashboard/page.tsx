"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchAllUsers } from "@/lib/api";
import PixTransactionForm from "@/components/pix-transaction-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, RefreshCw, LogOut } from "lucide-react";
import TokenDisplay from "@/components/token-display";
import UserTokensList from "@/components/user-tokens-list";

export default function Dashboard() {
  const router = useRouter();
  const { isAuthenticated, logout, user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("users");

  // Fetch users when component mounts or when a refresh is triggered
  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchAllUsers();
      if (response.success) {
        setUsers(response.data);
      } else {
        setError(response.error || "Failed to fetch users");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Check authentication and fetch users on component mount
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
      return;
    }
    
    fetchUsers();
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleTransactionComplete = () => {
    // Refresh users list after transaction to update token status
    fetchUsers();
    // Switch to users tab to show the updated list
    setActiveTab("users");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={fetchUsers}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
          <Button variant="destructive" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Your Account</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-1">Username: <span className="font-medium text-foreground">{user?.username}</span></p>
            <p className="text-sm text-muted-foreground">Email: <span className="font-medium text-foreground">{user?.email}</span></p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Your Token Status</CardTitle>
          </CardHeader>
          <CardContent>
            <TokenDisplay />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Rate Limiting Info</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              Each user has a limited number of tokens for API requests. Tokens are replenished over time.
              When you run out of tokens, you'll need to wait until they're refilled.
            </p>
            <p className="text-sm font-medium">
              This is the Leaky Bucket algorithm in action.
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="users">Users & Tokens</TabsTrigger>
          <TabsTrigger value="transaction">Send PIX Transaction</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <UserTokensList users={users} isLoading={isLoading} />
        </TabsContent>
        <TabsContent value="transaction">
          <PixTransactionForm onComplete={handleTransactionComplete} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
