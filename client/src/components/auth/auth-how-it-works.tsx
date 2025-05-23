import { UserPlus, Calendar, Video, MessageSquare } from "lucide-react";

export function AuthHowItWorks() {
  const steps = [
    {
      icon: <UserPlus className="h-12 w-12" />,
      title: "Create Your Profile",
      description: "Sign up and create your profile as a mentee seeking guidance or a mentor offering expertise."
    },
    {
      icon: <Calendar className="h-12 w-12" />,
      title: "Schedule Sessions",
      description: "Browse available mentors, view their expertise, and schedule sessions at convenient times."
    },
    {
      icon: <Video className="h-12 w-12" />,
      title: "Meet and Learn",
      description: "Connect through our integrated video platform for personalized one-on-one mentoring sessions."
    },
    {
      icon: <MessageSquare className="h-12 w-12" />,
      title: "Give Feedback",
      description: "Share feedback after sessions to help improve the mentoring experience for everyone."
    }
  ];

  return (
    <div id="how-it-works" className="bg-gray-50 dark:bg-gray-900 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">How MentorHub Works</h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Simple steps to start your mentoring journey
          </p>
        </div>
        
        <div className="relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-primary/30 dark:bg-primary-light/30 -translate-x-1/2"></div>
          
          <div className="space-y-12 md:space-y-0 relative">
            {steps.map((step, index) => (
              <div key={index} className={`md:flex ${index % 2 === 0 ? '' : 'md:flex-row-reverse'} items-center`}>
                <div className={`md:w-1/2 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
                </div>
                
                <div className="mx-auto md:mx-0 my-4 md:my-0 relative">
                  <div className="w-16 h-16 rounded-full bg-primary/10 dark:bg-primary-dark/30 flex items-center justify-center z-10 relative">
                    <div className="text-primary dark:text-primary-light">
                      {step.icon}
                    </div>
                  </div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-primary/5 dark:bg-primary-dark/20 animate-pulse"></div>
                </div>
                
                <div className="md:w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
