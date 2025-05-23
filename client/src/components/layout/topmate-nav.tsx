import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "wouter";
import { Menu } from "lucide-react";

interface TopMateNavProps {
  onLoginClick?: () => void;
  onSignUpClick?: () => void;
}

export function TopMateNav({ onLoginClick, onSignUpClick }: TopMateNavProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Logo />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <nav className="flex items-center space-x-1">
              <a
                href="#features"
                className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                How It Works
              </a>
              <a
                href="#testimonials"
                className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Testimonials
              </a>
            </nav>

            <div className="flex items-center space-x-2 ml-4">
              <ThemeToggle className="hover:scale-105 transition-transform" />
              
              {/* Sign Up Dropdown - Similar to Topmate */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="default" className="font-medium">
                    Sign Up
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel className="font-normal text-gray-500 dark:text-gray-400 uppercase text-xs tracking-wider">
                    FOR MENTEES
                  </DropdownMenuLabel>
                  <DropdownMenuGroup>
                    <DropdownMenuItem 
                      className="cursor-pointer"
                      onClick={() => {
                        if (onLoginClick) onLoginClick();
                        setIsMenuOpen(false);
                      }}
                    >
                      Login
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="cursor-pointer"
                      onClick={() => {
                        if (onSignUpClick) onSignUpClick();
                        setIsMenuOpen(false);
                      }}
                    >
                      Sign up
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuLabel className="font-normal text-gray-500 dark:text-gray-400 uppercase text-xs tracking-wider">
                    FOR MENTORS
                  </DropdownMenuLabel>
                  <DropdownMenuGroup>
                    <DropdownMenuItem 
                      className="cursor-pointer"
                      onClick={() => {
                        if (onLoginClick) onLoginClick();
                        setIsMenuOpen(false);
                      }}
                    >
                      Login
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="cursor-pointer"
                      onClick={() => {
                        if (onSignUpClick) onSignUpClick();
                        setIsMenuOpen(false);
                      }}
                    >
                      Sign up
                    </DropdownMenuItem>

                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <ThemeToggle className="mr-2" />
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 dark:text-gray-300"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <a
              href="#features"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setIsMenuOpen(false)}
            >
              How It Works
            </a>
            <a
              href="#testimonials"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setIsMenuOpen(false)}
            >
              Testimonials
            </a>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-800 pt-2 pb-3">
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              For Mentees
            </div>
            <a
              href="#"
              className="block px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => {
                if (onLoginClick) onLoginClick();
                setIsMenuOpen(false);
              }}
            >
              Login
            </a>
            <a
              href="#"
              className="block px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => {
                if (onSignUpClick) onSignUpClick();
                setIsMenuOpen(false);
              }}
            >
              Sign up
            </a>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-800 pt-2 pb-3">
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              For Mentors
            </div>
            <a
              href="#"
              className="block px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => {
                if (onLoginClick) onLoginClick();
                setIsMenuOpen(false);
              }}
            >
              Login
            </a>
            <a
              href="#"
              className="block px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => {
                if (onSignUpClick) onSignUpClick();
                setIsMenuOpen(false);
              }}
            >
              Sign up
            </a>

          </div>
        </div>
      )}
    </header>
  );
}
