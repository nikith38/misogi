import React from "react";

import { CTASection } from "@/components/ui/cta-section";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X } from "lucide-react";
import { FoodShareStyleHero } from "@/components/ui/foodshare-style-hero";
import { FeatureCards } from "@/components/ui/feature-cards";
import { TestimonialCards } from "@/components/ui/testimonial-cards";
import { ScrollAnimation } from "@/components/ui/scroll-animation";
import { TopMateNav } from "@/components/layout/topmate-nav";

export function LandingPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register" | "">("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"mentee" | "mentor">("mentee");
  const [formError, setFormError] = useState("");
  
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
      },
      onError: (error) => {
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
      },
      onError: (error) => {
        setFormError(error.message);
      }
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background overflow-x-hidden">
      {/* Topmate-style Navigation */}
      <TopMateNav 
        onLoginClick={() => setActiveTab("login")} 
        onSignUpClick={() => setActiveTab("register")} 
      />

      {/* FoodShare-style Hero Section */}
      <ScrollAnimation>
        <section>
          <FoodShareStyleHero />
        </section>
      </ScrollAnimation>

      {/* Features Section */}
      <div id="features">
        <ScrollAnimation delay={0.1}>
          <FeatureCards />
        </ScrollAnimation>
      </div>

      {/* Testimonials Section */}
      <div id="testimonials">
        <ScrollAnimation delay={0.3}>
          <TestimonialCards />
        </ScrollAnimation>
      </div>

      {/* CTA Section */}
      <ScrollAnimation delay={0.4}>
        <CTASection 
          onGetStarted={() => setActiveTab("register")} 
          onLearnMore={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
        />
      </ScrollAnimation>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ScrollAnimation delay={0.1}>
              <div>
                <h3 className="text-lg font-semibold mb-4">About Us</h3>
                <p className="text-slate-400">MentorHub connects aspiring professionals with experienced mentors for career guidance and growth.</p>
              </div>
            </ScrollAnimation>
            <ScrollAnimation delay={0.2}>
              <div>
                <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li><a href="#features" className="text-slate-400 hover:text-white transition-colors">Features</a></li>
                  <li><a href="#how-it-works" className="text-slate-400 hover:text-white transition-colors">How It Works</a></li>
                  <li><a href="#testimonials" className="text-slate-400 hover:text-white transition-colors">Testimonials</a></li>
                </ul>
              </div>
            </ScrollAnimation>
            <ScrollAnimation delay={0.3}>
              <div>
                <h3 className="text-lg font-semibold mb-4">Contact</h3>
                <p className="text-slate-400">Have questions? Reach out to us at support@mentorhub.com</p>
              </div>
            </ScrollAnimation>
          </div>
          <ScrollAnimation delay={0.4}>
            <div className="mt-8 pt-8 border-t border-slate-800 text-center text-slate-400">
              <p>&copy; {new Date().getFullYear()} MentorHub. All rights reserved.</p>
            </div>
          </ScrollAnimation>
        </div>
      </footer>

      {/* Auth Forms Modal */}
      {(activeTab === "login" || activeTab === "register") && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="max-w-md w-full">
            <Card className="w-full shadow-lg border-border/50 animate-slide-up">
              <CardHeader className="relative">
                <button 
                  onClick={() => setActiveTab("")} 
                  className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
                <CardTitle className="text-2xl font-bold text-center">
                  {activeTab === "login" ? "Log in to your account" : "Create your account"}
                </CardTitle>
                <CardDescription className="text-center">
                  {activeTab === "login" 
                    ? "Enter your credentials to access your account" 
                    : "Fill out the form below to get started"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "register")}>
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="register">Register</TabsTrigger>
                  </TabsList>
                  <TabsContent value="login" className="animate-in fade-in-50 duration-250 data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0">
                    <form onSubmit={handleSignIn} className="space-y-4">
                      {formError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md text-sm">
                          {formError}
                        </div>
                      )}
                      <div className="space-y-2">
                        <label htmlFor="username" className="text-sm font-medium">Username</label>
                        <input 
                          id="username" 
                          type="text" 
                          placeholder="Enter your username"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium">Password</label>
                        <input 
                          id="password" 
                          type="password" 
                          placeholder="Enter your password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full relative" 
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
                          <>
                            <span className="opacity-0">Sign In</span>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                            </div>
                          </>
                        ) : (
                          "Sign In"
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                  <TabsContent value="register">
                    <form onSubmit={handleRegister} className="space-y-4">
                      {formError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md text-sm">
                          {formError}
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label htmlFor="firstName" className="text-sm font-medium">First Name</label>
                          <input 
                            id="firstName" 
                            type="text" 
                            placeholder="John"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="lastName" className="text-sm font-medium">Last Name</label>
                          <input 
                            id="lastName" 
                            type="text" 
                            placeholder="Doe"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="username" className="text-sm font-medium">Username</label>
                        <input 
                          id="reg-username" 
                          type="text" 
                          placeholder="johndoe"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">Email</label>
                        <input 
                          id="reg-email" 
                          type="email" 
                          placeholder="john.doe@example.com"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label htmlFor="reg-password" className="text-sm font-medium">Password</label>
                          <input 
                            id="reg-password" 
                            type="password" 
                            placeholder="Create a password"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</label>
                          <input 
                            id="confirmPassword" 
                            type="password" 
                            placeholder="Confirm password"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="role" className="text-sm font-medium">I want to join as:</label>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <div 
                            className={`border rounded-md p-4 text-center cursor-pointer transition-colors ${role === "mentee" ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary"}`}
                            onClick={() => setRole("mentee")}
                          >
                            <p className="font-medium">Mentee</p>
                            <p className="text-xs text-gray-500">Looking for guidance</p>
                          </div>
                          <div 
                            className={`border rounded-md p-4 text-center cursor-pointer transition-colors ${role === "mentor" ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary"}`}
                            onClick={() => setRole("mentor")}
                          >
                            <p className="font-medium">Mentor</p>
                            <p className="text-xs text-gray-500">Offering expertise</p>
                          </div>
                        </div>
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full relative" 
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? (
                          <>
                            <span className="opacity-0">Create Account</span>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
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
          </div>
        </div>
      )}
    </div>
  );
}
