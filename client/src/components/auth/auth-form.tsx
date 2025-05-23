import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

interface AuthFormProps {
  defaultTab?: "login" | "register";
  onComplete?: () => void;
  className?: string;
}

export function AuthForm({ defaultTab = "login", onComplete, className = "" }: AuthFormProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">(defaultTab);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"mentee" | "mentor">("mentee");
  const [formError, setFormError] = useState("");
  
  // Sample data for autofill based on role selection
  const menteeData = {
    firstName: "Alex",
    lastName: "Learner",
    email: "alex.learner@example.com",
    username: "alexlearner"
  };
  
  const mentorData = {
    firstName: "Sam",
    lastName: "Expert",
    email: "sam.expert@example.com",
    username: "samexpert"
  };
  
  const { loginMutation, registerMutation } = useAuth();
  
  // Handle sign in
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    
    // Validate form
    if (!username || !password) {
      setFormError("Please fill in all required fields");
      return;
    }
    
    // Use the login mutation from the auth context
    loginMutation.mutate({ username, password }, {
      onSuccess: () => {
        // Redirect to dashboard on successful login
        window.location.href = "/";
        onComplete?.();
      },
      onError: (error: { message: string }) => {
        setFormError(error.message);
      }
    });
  };
  
  // Handle registration
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    
    // Validate form
    if (!username || !password || !email || !firstName || !lastName) {
      setFormError("Please fill in all required fields");
      return;
    }
    
    if (password !== confirmPassword) {
      setFormError("Passwords don't match");
      return;
    }
    
    // Use the register mutation from the auth context
    registerMutation.mutate({
      username,
      password,
      email,
      firstName,
      lastName,
      role
    }, {
      onSuccess: () => {
        // Redirect to dashboard on successful registration
        window.location.href = "/";
        onComplete?.();
      },
      onError: (error: { message: string }) => {
        setFormError(error.message);
      }
    });
  };

  return (
    <Card className={`w-full shadow-lg border-border/50 ${className} animate-slide-up`}>
      <CardHeader className="relative py-4">
        <CardTitle className="text-xl font-bold text-center">
          {activeTab === "login" ? "Log in to your account" : "Create your account"}
        </CardTitle>
        <CardDescription className="text-center text-sm">
          {activeTab === "login" 
            ? "Enter your credentials to access your account" 
            : "Fill out the form below to get started"}
        </CardDescription>
      </CardHeader>
      <CardContent className="max-h-[60vh] overflow-y-auto py-2 px-4">
        <Tabs defaultValue={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "register")}>
          <TabsList className="grid w-full grid-cols-2 mb-3">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          <TabsContent value="login" className="animate-in fade-in-50 duration-250 data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0">
            <form onSubmit={handleSignIn} className="space-y-3">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-1.5 rounded-md text-xs">
                  {formError}
                </div>
              )}
              <div className="space-y-1">
                <label htmlFor="username" className="text-xs font-medium">Username</label>
                <input 
                  id="username" 
                  type="text" 
                  placeholder="Enter your username"
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="password" className="text-xs font-medium">Password</label>
                <input 
                  id="password" 
                  type="password" 
                  placeholder="Enter your password"
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full relative py-1.5 h-auto text-sm mt-2" 
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <>
                    <span className="opacity-0">Sign In</span>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                    </div>
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-3">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-1.5 rounded-md text-xs">
                  {formError}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="firstName" className="text-xs font-medium">First Name</label>
                  <input 
                    id="firstName" 
                    type="text" 
                    placeholder="John"
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="lastName" className="text-xs font-medium">Last Name</label>
                  <input 
                    id="lastName" 
                    type="text" 
                    placeholder="Doe"
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label htmlFor="username" className="text-xs font-medium">Username</label>
                <input 
                  id="reg-username" 
                  type="text" 
                  placeholder="johndoe"
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="email" className="text-xs font-medium">Email</label>
                <input 
                  id="reg-email" 
                  type="email" 
                  placeholder="john.doe@example.com"
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="reg-password" className="text-xs font-medium">Password</label>
                  <input 
                    id="reg-password" 
                    type="password" 
                    placeholder="Create a password"
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="confirmPassword" className="text-xs font-medium">Confirm Password</label>
                  <input 
                    id="confirmPassword" 
                    type="password" 
                    placeholder="Confirm password"
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label htmlFor="role" className="text-xs font-medium">I want to join as:</label>
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <div 
                    className={`border rounded-md p-2 text-center cursor-pointer transition-colors ${role === "mentee" ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary"}`}
                    onClick={() => {
                      setRole("mentee");
                      // Autofill form with mentee sample data
                      setFirstName(menteeData.firstName);
                      setLastName(menteeData.lastName);
                      setEmail(menteeData.email);
                      setUsername(menteeData.username);
                    }}
                  >
                    <p className="font-medium text-sm">Mentee</p>
                    <p className="text-xs text-gray-500">Looking for guidance</p>
                  </div>
                  <div 
                    className={`border rounded-md p-2 text-center cursor-pointer transition-colors ${role === "mentor" ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary"}`}
                    onClick={() => {
                      setRole("mentor");
                      // Autofill form with mentor sample data
                      setFirstName(mentorData.firstName);
                      setLastName(mentorData.lastName);
                      setEmail(mentorData.email);
                      setUsername(mentorData.username);
                    }}
                  >
                    <p className="font-medium text-sm">Mentor</p>
                    <p className="text-xs text-gray-500">Offering expertise</p>
                  </div>
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full relative py-1.5 h-auto text-sm mt-2" 
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? (
                  <>
                    <span className="opacity-0">Create Account</span>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                    </div>
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 