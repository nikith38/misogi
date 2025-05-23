import { Calendar, GraduationCap, Users, MessageSquare, Clock, Award } from "lucide-react";

export function AuthFeatures() {
  const features = [
    {
      icon: <Users className="h-10 w-10" />,
      title: "Expert Mentors",
      description: "Connect with professionals who have real-world experience in your field."
    },
    {
      icon: <Calendar className="h-10 w-10" />,
      title: "Flexible Scheduling",
      description: "Book sessions that fit your calendar with our easy scheduling system."
    },
    {
      icon: <GraduationCap className="h-10 w-10" />,
      title: "Skill Development",
      description: "Track your progress and grow with personalized feedback after each session."
    },
    {
      icon: <MessageSquare className="h-10 w-10" />,
      title: "Personalized Feedback",
      description: "Receive detailed feedback to help you improve and grow professionally."
    },
    {
      icon: <Clock className="h-10 w-10" />,
      title: "Time Management",
      description: "Optimize your learning journey with efficient time management tools."
    },
    {
      icon: <Award className="h-10 w-10" />,
      title: "Recognition",
      description: "Earn badges and certificates as you progress through your learning journey."
    }
  ];

  return (
    <div id="features" className="bg-white dark:bg-gray-800 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Why Choose MentorHub?</h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Our platform offers everything you need for effective mentorship
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div className="text-primary dark:text-primary-light mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
