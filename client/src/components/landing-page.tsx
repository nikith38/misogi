import React from "react";

import { CTASection } from "@/components/ui/cta-section";
import { useState } from "react";
import { X } from "lucide-react";
import { FoodShareStyleHero } from "@/components/ui/foodshare-style-hero";
import { FeatureCards } from "@/components/ui/feature-cards";
import { TestimonialCards } from "@/components/ui/testimonial-cards";
import { ScrollAnimation } from "@/components/ui/scroll-animation";
import { TopMateNav } from "@/components/layout/topmate-nav";
import { AuthForm } from "@/components/auth/auth-form";

export function LandingPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register" | "">("");
  
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

      {/* Auth Modal */}
      {(activeTab === "login" || activeTab === "register") && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="max-w-md w-full max-h-[90vh] overflow-hidden">
            <div className="relative">
              <button 
                onClick={() => setActiveTab("")} 
                className="absolute right-2 top-2 z-10 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-white dark:bg-gray-800 rounded-full p-1"
                aria-label="Close"
              >
                <X size={18} />
              </button>
              <AuthForm 
                defaultTab={activeTab as "login" | "register"} 
                onComplete={() => setActiveTab("")}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
