'use client';
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Calendar,
  Home,
  Navigation,
  MessageSquare,
  ExternalLink
} from 'lucide-react';

// TypeScript interfaces
interface ContactInfo {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  details: string[];
}

interface Service {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action: string;
}

interface FormData {
  fullName: string;
  phoneNumber: string;
  email: string;
  service: string;
  message: string;
}

// Custom hook for scroll animations
const useScrollAnimation = (): void => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = document.querySelectorAll('.scroll-animate');
    elements.forEach((el) => {
      const element = el as HTMLElement;
      element.style.transition = 'all 0.8s ease-out';
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);
};

const Locations: React.FC = () => {
  useScrollAnimation();
  
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    phoneNumber: '',
    email: '',
    service: '',
    message: ''
  });
  
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  // Trigger initial animations
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const contactInfo: ContactInfo[] = [
    {
      icon: MapPin,
      title: 'Our Location',
      details: [
        'Mega Diagnostics Udaipur',
        'Medical Complex',
        'Udaipur, Rajasthan - 313001'
      ]
    },
    {
      icon: Phone,
      title: 'Phone Numbers',
      details: [
        'Main: +91 93514 11126',
        'Emergency: +91 90243 11126',
        'WhatsApp: ++91 97834 17878'
      ]
    },
    {
      icon: Mail,
      title: 'Email',
      details: [
        'info@megadiagnosticsudaipur.com',
        'appointments@megadiagnosticsudaipur.com',
        'emergency@megadiagnosticsudaipur.com'
      ]
    },
    {
      icon: Clock,
      title: 'Working Hours',
      details: [
        'Monday - Saturday: 8:00 AM - 8:00 PM',
        'Sunday: 9:00 AM - 5:00 PM',
        'Emergency Services: 24/7'
      ]
    }
  ];

  const services: Service[] = [
    {
      icon: Calendar,
      title: 'Book Appointment',
      description: 'Schedule your consultation or procedure',
      action: 'Book Now'
    },
    {
      icon: Home,
      title: 'Home Collection',
      description: 'Sample collection at your doorstep',
      action: 'Request Collection'
    },
    {
      icon: MessageSquare,
      title: 'Emergency Line',
      description: '24/7 emergency medical assistance',
      action: 'Call Emergency'
    }
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (): void => {
    // Form submission logic would go here
    console.log('Form Data:', formData);
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  const openGoogleMaps = (): void => {
    const address = "MEGA DIAGNOSTICS AND INTERVENTIONS udaipur";
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen">
      <style jsx>{`
        .fade-in {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s ease-out;
        }
        
        .fade-in.visible {
          opacity: 1;
          transform: translateY(0);
        }
        
        .scale-in {
          opacity: 0;
          transform: scale(0.95);
          transition: all 0.8s ease-out;
        }
        
        .scale-in.visible {
          opacity: 1;
          transform: scale(1);
        }
        
        .bounce-in {
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.6s ease-out;
        }
        
        .bounce-in.visible {
          opacity: 1;
          transform: translateY(0);
        }
        
        @keyframes pulse-custom {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        
        .pulse-custom {
          animation: pulse-custom 3s ease-in-out infinite;
        }
      `}</style>

      {/* Map Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 scroll-animate">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-12 fade-in ${isVisible ? 'visible' : ''}`}>
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Find Us</h2>
            <p className="text-xl text-gray-600">
              Located in the heart of Udaipur, easily accessible from all major areas.
            </p>
          </div>
          
          <Card className={`overflow-hidden shadow-2xl border-0 scale-in ${isVisible ? 'visible' : ''}`}>
            <div className="relative w-full h-96 md:h-[500px] rounded-lg overflow-hidden group">
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg z-10">
                <h4 className="font-semibold text-sm text-gray-900 mb-1">Mega Diagnostics Udaipur</h4>
                <p className="text-xs text-gray-600">Medical Complex, Udaipur</p>
              </div>
            <iframe
  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3627.947901470098!2d73.68974368917718!3d24.594146459545655!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjTCsDM1JzM4LjkiTiA3M8KwNDEnMzIuNCJF!5e0!3m2!1sen!2sin!4v1706195520000!5m2!1sen!2sin"
  className="w-full h-full border-0 transition-all duration-300 group-hover:contrast-110 group-hover:saturate-110"
  allowFullScreen
  loading="lazy"
  referrerPolicy="no-referrer-when-downgrade"
  title="Mega Diagnostics Udaipur Location"
/>

            </div>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            {[
              { title: 'From Airport', desc: '15 minutes drive from Udaipur Airport', icon: '✈️' },
              { title: 'From Railway Station', desc: '10 minutes from Udaipur City Railway Station', icon: '🚂' },
              { title: 'Parking', desc: 'Free parking available for patients', icon: '🅿️' },
              { title: 'Public Transport', desc: 'Well connected by bus routes', icon: '🚌' }
            ].map((item, index) => (
              <Card 
                key={index} 
                className={`p-4 text-center shadow-lg border-0 hover:-translate-y-2 transition-all duration-300 bounce-in ${isVisible ? 'visible' : ''}`}
                style={{ transitionDelay: `${600 + index * 100}ms` }}
              >
                <CardContent className="p-0">
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className={`text-center mt-8 fade-in ${isVisible ? 'visible' : ''}`} style={{ transitionDelay: '1200ms' }}>
            <Button 
              onClick={openGoogleMaps}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transform hover:scale-105 transition-all duration-300 shadow-lg px-8 py-3"
            >
              <Navigation className="mr-2 h-5 w-5" />
              Get Directions on Google Maps
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>



      {/* Emergency Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-red-50">
        <div className={`max-w-7xl mx-auto scale-in ${isVisible ? 'visible' : ''}`} style={{ transitionDelay: '200ms' }}>
          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white p-8 shadow-2xl border-0 pulse-custom">
            <CardContent className="p-0 text-center">
              <Phone className="h-12 w-12 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">Medical Emergency?</h2>
              <p className="text-xl mb-6 opacity-90">
                For immediate medical assistance, call our emergency line available 24/7.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-white text-red-600 hover:bg-gray-100 font-semibold px-8 py-4 transform hover:scale-105 transition-all duration-300 shadow-lg"
                  onClick={() => window.location.href = 'tel:+919783417878'}
                >
                  <Phone className="mr-2 h-5 w-5" />
                  Call Emergency: +91 97834 17878
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Locations;