import { Star } from "lucide-react";

export function AuthTestimonials() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Software Developer",
      image: "https://randomuser.me/api/portraits/women/32.jpg",
      quote: "MentorHub connected me with an experienced developer who helped me advance my career. The structured sessions and feedback were invaluable.",
      stars: 5
    },
    {
      name: "Michael Chen",
      role: "UX Designer",
      image: "https://randomuser.me/api/portraits/men/44.jpg",
      quote: "As someone transitioning into tech, the mentorship I received through MentorHub was exactly what I needed to build my portfolio and land my first job.",
      stars: 5
    },
    {
      name: "Jessica Williams",
      role: "Product Manager",
      image: "https://randomuser.me/api/portraits/women/65.jpg",
      quote: "I've been both a mentee and mentor on MentorHub. The platform makes scheduling and feedback seamless, allowing me to focus on what matters - growth.",
      stars: 4
    }
  ];

  return (
    <div id="testimonials" className="bg-white dark:bg-gray-800 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">What Our Users Say</h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Hear from professionals who have transformed their careers through MentorHub
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center mb-4">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name} 
                  className="w-12 h-12 rounded-full mr-4 border-2 border-primary"
                />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{testimonial.role}</p>
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 mb-4 italic">"{testimonial.quote}"</p>
              
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i}
                    className={`w-5 h-5 ${i < testimonial.stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
