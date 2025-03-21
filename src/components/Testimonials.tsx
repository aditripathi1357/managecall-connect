
import { useState } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

interface Testimonial {
  content: string;
  author: string;
  role: string;
  company: string;
}

const Testimonials = () => {
  const testimonials: Testimonial[] = [
    {
      content:
        "CallTrack has completely transformed how we handle customer communications. The analytics capabilities have helped us identify patterns and improve our response times significantly.",
      author: "Sarah Johnson",
      role: "Customer Service Manager",
      company: "TechSolutions Inc.",
    },
    {
      content:
        "As a sales team leader, I needed a reliable way to track call performance across my team. CallTrack provides exactly that, with intuitive dashboards and detailed reporting that has helped us increase conversions by 35%.",
      author: "Michael Rodriguez",
      role: "Sales Director",
      company: "GrowthPartners LLC",
    },
    {
      content:
        "The ease of implementation and user-friendly interface made CallTrack an instant hit with our team. The insights we've gained have directly contributed to our improved customer satisfaction ratings.",
      author: "Jennifer Chen",
      role: "Operations Director",
      company: "Innovate Systems",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  return (
    <section className="page-section bg-white">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <h2 className="section-heading">What our clients say</h2>
          <p className="section-subheading">
            Don't just take our word for it. Here's what businesses using CallTrack have to say about their experience.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative bg-blue-50 rounded-2xl p-8 md:p-12 shadow-subtle">
            <div className="absolute top-8 left-8 text-primary opacity-20">
              <Quote size={60} />
            </div>

            <div className="relative z-10">
              <p className="text-lg md:text-xl mb-8 text-balance">
                {testimonials[currentIndex].content}
              </p>

              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="mb-4 md:mb-0">
                  <h4 className="text-lg font-medium">
                    {testimonials[currentIndex].author}
                  </h4>
                  <p className="text-muted-foreground">
                    {testimonials[currentIndex].role}, {testimonials[currentIndex].company}
                  </p>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={prevTestimonial}
                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary transition-colors"
                    aria-label="Previous testimonial"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={nextTestimonial}
                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary transition-colors"
                    aria-label="Next testimonial"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 flex justify-center -mb-3">
              <div className="flex space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-8 h-1 rounded-full transition-all ${
                      currentIndex === index ? "bg-primary" : "bg-gray-300"
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
