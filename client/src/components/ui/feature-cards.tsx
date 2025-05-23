import React from "react";
import { Users, Calendar, BookOpen, MessageSquare, Clock, Award } from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  return (
    <div className="bg-white dark:bg-gray-800/80 rounded-lg shadow-md border border-gray-100 dark:border-gray-700 p-6 transition-all hover:shadow-lg hover:translate-y-[-2px] group">
      <div className="bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
};

export function FeatureCards() {
  const features = [
    {
      icon: <Users className="h-6 w-6" />,
      title: "Expert Mentorship",
      description: "Connect with industry professionals who provide personalized guidance to accelerate your career growth."
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Smart Scheduling",
      description: "Effortlessly book sessions that fit your calendar with our intuitive scheduling system."
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: "Skill Development Tracking",
      description: "Monitor your progress with detailed analytics and visualizations of your growth journey."
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "Structured Feedback",
      description: "Receive actionable insights after each session to continuously improve your skills."
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Time Management",
      description: "Optimize your learning journey with efficient time management tools and reminders."
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: "Achievement Recognition",
      description: "Earn badges and certificates as you reach milestones in your professional development."
    }
  ];

  return (
    <div className="w-full py-16 px-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose <span className="text-primary dark:text-primary-foreground">MentorHub</span>?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Our platform offers everything you need for effective mentorship and career growth
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
