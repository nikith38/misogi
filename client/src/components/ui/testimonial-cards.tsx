import React from "react";
import { Star } from "lucide-react";

interface TestimonialCardProps {
  quote: string;
  name: string;
  title: string;
  avatar: string;
  rating: number;
}

const TestimonialCard = ({ quote, name, title, avatar, rating }: TestimonialCardProps) => {
  return (
    <div className="bg-white dark:bg-gray-800/80 rounded-lg shadow-md border border-gray-100 dark:border-gray-700 p-6 transition-all hover:shadow-lg hover:translate-y-[-2px]">
      <div className="flex mb-4">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className="h-5 w-5 text-yellow-400 dark:text-yellow-300 fill-current" 
          />
        ))}
      </div>
      
      <p className="text-gray-700 dark:text-gray-200 italic mb-6">"{quote}"</p>
      
      <div className="flex items-center">
        <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
          <img src={avatar} alt={name} className="h-full w-full object-cover" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white">{name}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
        </div>
      </div>
    </div>
  );
};

export function TestimonialCards() {
  const testimonials = [
    {
      quote: "MentorHub completely transformed my career path. The mentorship I received helped me land my dream job in tech within just 3 months.",
      name: "Sarah Johnson",
      title: "Frontend Developer",
      avatar: "https://randomuser.me/api/portraits/women/32.jpg",
      rating: 5
    },
    {
      quote: "As a mentor, I've found MentorHub to be the perfect platform to give back to the community. The scheduling and feedback tools are exceptional.",
      name: "Michael Chen",
      title: "Senior Software Engineer",
      avatar: "https://randomuser.me/api/portraits/men/46.jpg",
      rating: 5
    },
    {
      quote: "The structured approach to mentorship on MentorHub has accelerated my learning curve. I've gained more practical knowledge in weeks than I did in years of formal education.",
      name: "Priya Patel",
      title: "Data Scientist",
      avatar: "https://randomuser.me/api/portraits/women/65.jpg",
      rating: 5
    }
  ];

  return (
    <div className="w-full py-16 px-4 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Success Stories <span className="text-red-400 dark:text-red-300">❤️</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Hear from professionals who have transformed their careers with MentorHub
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              quote={testimonial.quote}
              name={testimonial.name}
              title={testimonial.title}
              avatar={testimonial.avatar}
              rating={testimonial.rating}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
