'use client';
import MegaDiagnosticsNavbar from '../navbar/navbar';
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Award, 
  Users, 
  Heart, 
  Target,
  CheckCircle,
  MapPin,
  Clock,
  Shield,
  Stethoscope,
  Activity,
  Star,
  Phone,
  Mail,
  Microscope,
  Zap,
  UserCheck,
  HeartHandshake,
  Calendar,
  Building2,
  Sparkles,
  GraduationCap,
  TrendingUp,
  Coffee,
  Gift,
  Briefcase,
  Send,
  FileText,
  DollarSign,
  PlusCircle,
  ArrowRight,
  ChevronRight,
  Globe,
  BookOpen,
  Car,
  Home,
  User,
} from 'lucide-react';

// Custom hook for scroll animations
const useScrollAnimation = () => {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            element.style.opacity = '1';
            element.style.transform = 'translateY(0) translateX(0) scale(1)';
            element.classList.add('animate-visible');
          }
        });
      },
      { 
        threshold: 0.1, 
        rootMargin: '0px 0px -50px 0px' 
      }
    );

    const elements = document.querySelectorAll('.scroll-animate');
    elements.forEach((el) => {
      if (observerRef.current) {
        observerRef.current.observe(el);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);
};

const MegaCareers = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    position: '',
    experience: '',
    qualification: '',
    currentLocation: '',
    availability: '',
    message: ''
  });

  useScrollAnimation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Format the message for WhatsApp
    const message = `Hi! I'm interested in joining Mega Diagnostics.

📝 Application Details:
• Name: ${formData.fullName}
• Email: ${formData.email}
• Phone: ${formData.phone}
• Position Applied: ${formData.position}
• Experience: ${formData.experience}
• Qualification: ${formData.qualification}
• Current Location: ${formData.currentLocation}
• Availability: ${formData.availability}

Additional Message:
${formData.message || 'N/A'}

Looking forward to hearing from you!`;

    // WhatsApp number
    const whatsappNumber = '919783417878';
    
    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    
    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
  };

  const benefits = [
    {
      title: 'Competitive Salary',
      description: 'Market-leading compensation packages',
      icon: DollarSign
    },
    {
      title: 'Health Insurance',
      description: 'Comprehensive medical coverage for you and family',
      icon: Shield
    },
    {
      title: 'Professional Growth',
      description: 'Continuous learning and career advancement opportunities',
      icon: TrendingUp
    },
    {
      title: 'Flexible Hours',
      description: 'Work-life balance with flexible scheduling',
      icon: Clock
    },
    {
      title: 'Training Programs',
      description: 'Regular skill development and certification programs',
      icon: GraduationCap
    },
    {
      title: 'Team Events',
      description: 'Regular team building activities and celebrations',
      icon: Users
    }
  ];

  const whyWorkWithUs = [
    {
      title: 'Innovation & Technology',
      description: 'Work with cutting-edge medical technology and contribute to healthcare innovation',
      icon: Zap
    },
    {
      title: 'Professional Excellence',
      description: 'Be part of a team that maintains highest standards of medical practice',
      icon: Star
    },
    {
      title: 'Patient Impact',
      description: 'Make a direct difference in patient lives through accurate diagnostics',
      icon: Heart
    },
    {
      title: 'Growth Opportunities',
      description: 'Advance your career with continuous learning and development programs',
      icon: TrendingUp
    },
    {
      title: 'Collaborative Environment',
      description: 'Work alongside experienced professionals from top medical institutes',
      icon: Users
    },
    {
      title: 'Work-Life Balance',
      description: 'Enjoy flexible schedules and supportive work environment',
      icon: HeartHandshake
    }
  ];

  const positions = [
    'Senior Radiologist',
    'Clinical Pathologist', 
    'Radiology Technician',
    'Lab Technologist',
    'Patient Care Coordinator',
    'Biomedical Engineer',
    'Reception Staff',
    'Administrative Assistant',
    'Quality Control Specialist',
    'IT Support Specialist',
    'Other'
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-gray-50">
      <MegaDiagnosticsNavbar/>
      <style jsx>{`
        .scroll-animate {
          transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .animate-visible {
          opacity: 1 !important;
          transform: translateY(0) translateX(0) scale(1) !important;
        }
      `}</style>

      {/* Hero Section */}
      <section className="py-[100px] md:py-[140px] bg-gradient-to-br from-purple-900 via-purple-800 to-purple-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Floating background elements */}
        <div className="absolute top-10 left-4 md:top-20 md:left-10 text-white/10 animate-bounce">
          <Briefcase className="h-6 w-6 md:h-8 md:w-8" />
        </div>
        <div className="absolute top-20 right-8 md:top-32 md:right-16 text-white/10 animate-pulse">
          <Users className="h-4 w-4 md:h-6 md:w-6" />
        </div>
        <div className="absolute bottom-10 left-8 md:bottom-20 md:left-20 text-white/10 animate-bounce" style={{animationDelay: '1s'}}>
          <GraduationCap className="h-8 w-8 md:h-10 md:w-10" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="scroll-animate" style={{ opacity: 0, transform: 'translateY(32px)' }}>
            <div className="inline-flex items-center gap-2 md:gap-3 mb-4 md:mb-6 bg-white/10 backdrop-blur-sm rounded-full px-4 md:px-6 py-2 md:py-3">
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-2 md:p-3 rounded-full">
                <Briefcase className="h-5 w-5 md:h-8 md:w-8 text-purple-900" />
              </div>
              <h1 className="text-xl md:text-5xl font-bold">Join Our Team</h1>
            </div>
            <p className="text-base md:text-xl max-w-4xl mx-auto mb-6 md:mb-8 leading-relaxed px-4">
              Be part of Rajasthan's premier diagnostic center and contribute to advancing healthcare 
              with cutting-edge technology and compassionate patient care.
            </p>
            <div className="inline-block bg-gradient-to-r from-yellow-400 to-yellow-500 px-4 md:px-8 py-2 md:py-3 rounded-full text-purple-900 font-bold text-sm md:text-lg shadow-lg">
              <Sparkles className="inline h-4 w-4 md:h-5 md:w-5 mr-2" />
              BUILD YOUR CAREER WITH MEGA
            </div>
          </div>
        </div>
      </section>

      {/* Why Work With Us */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16 scroll-animate" style={{ opacity: 0, transform: 'translateY(32px)' }}>
            <h2 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4 text-gray-900">Why Work With Us</h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Join a team that's passionate about healthcare innovation and patient care excellence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {whyWorkWithUs.map((reason, index) => (
              <Card key={index} className="p-4 md:p-6 shadow-lg border-0 hover:-translate-y-2 transition-all duration-300 scroll-animate bg-white/80 backdrop-blur-sm" style={{ opacity: 0, transform: 'scale(0.95)', transitionDelay: `${index * 100}ms` }}>
                <CardContent className="p-0">
                  <div className="bg-gradient-to-br from-purple-600 to-purple-800 text-white p-3 md:p-4 rounded-full w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300">
                    <reason.icon className="h-5 w-5 md:h-8 md:w-8" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3 text-center">{reason.title}</h3>
                  <p className="text-gray-600 text-sm md:text-base text-center leading-relaxed">{reason.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16 scroll-animate" style={{ opacity: 0, transform: 'translateY(32px)' }}>
            <h2 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
              Employee Benefits & Perks
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              We believe in taking care of our team members with comprehensive benefits
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="p-4 md:p-6 shadow-lg border-0 hover:-translate-y-2 transition-all duration-300 scroll-animate bg-white hover:shadow-xl" style={{ opacity: 0, transform: 'scale(0.95)', transitionDelay: `${index * 75}ms` }}>
                <CardContent className="p-0 text-center">
                  <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-purple-900 p-3 md:p-4 rounded-full w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300">
                    <benefit.icon className="h-5 w-5 md:h-7 md:w-7" />
                  </div>
                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600 text-xs md:text-sm leading-relaxed">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form Section */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 md:mb-16 scroll-animate" style={{ opacity: 0, transform: 'translateY(32px)' }}>
            <h2 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4 text-gray-900">Apply Now</h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Ready to join our team? Fill out the application form below and we'll get back to you soon!
            </p>
          </div>

          <Card className="shadow-xl border-0 scroll-animate bg-gradient-to-br from-white to-gray-50" style={{ opacity: 0, transform: 'translateY(32px)' }}>
            <CardContent className="p-8 md:p-12">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-bold text-gray-700 mb-2">
                      <User className="inline h-4 w-4 mr-1" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-300"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
                      <Mail className="inline h-4 w-4 mr-1" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-300"
                      placeholder="Enter your email address"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-bold text-gray-700 mb-2">
                      <Phone className="inline h-4 w-4 mr-1" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-300"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div>
                    <label htmlFor="position" className="block text-sm font-bold text-gray-700 mb-2">
                      <Briefcase className="inline h-4 w-4 mr-1" />
                      Position Applied For *
                    </label>
                    <select
                      id="position"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-300"
                    >
                      <option value="">Select a position</option>
                      {positions.map((pos, index) => (
                        <option key={index} value={pos}>{pos}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="experience" className="block text-sm font-bold text-gray-700 mb-2">
                      <Star className="inline h-4 w-4 mr-1" />
                      Years of Experience *
                    </label>
                    <select
                      id="experience"
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-300"
                    >
                      <option value="">Select experience</option>
                      <option value="Fresher">Fresher</option>
                      <option value="1-2 Years">1-2 Years</option>
                      <option value="3-5 Years">3-5 Years</option>
                      <option value="6-10 Years">6-10 Years</option>
                      <option value="10+ Years">10+ Years</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="qualification" className="block text-sm font-bold text-gray-700 mb-2">
                      <GraduationCap className="inline h-4 w-4 mr-1" />
                      Highest Qualification *
                    </label>
                    <input
                      type="text"
                      id="qualification"
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-300"
                      placeholder="e.g., MBBS, MD, BSc MLT, Diploma"
                    />
                  </div>

                  <div>
                    <label htmlFor="currentLocation" className="block text-sm font-bold text-gray-700 mb-2">
                      <MapPin className="inline h-4 w-4 mr-1" />
                      Current Location *
                    </label>
                    <input
                      type="text"
                      id="currentLocation"
                      name="currentLocation"
                      value={formData.currentLocation}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-300"
                      placeholder="Enter your current city"
                    />
                  </div>

                  <div>
                    <label htmlFor="availability" className="block text-sm font-bold text-gray-700 mb-2">
                      <Clock className="inline h-4 w-4 mr-1" />
                      Availability *
                    </label>
                    <select
                      id="availability"
                      name="availability"
                      value={formData.availability}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-300"
                    >
                      <option value="">Select availability</option>
                      <option value="Immediate">Immediate</option>
                      <option value="15 Days">15 Days</option>
                      <option value="1 Month">1 Month</option>
                      <option value="2 Months">2 Months</option>
                      <option value="3+ Months">3+ Months</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-bold text-gray-700 mb-2">
                    <FileText className="inline h-4 w-4 mr-1" />
                    Additional Message (Optional)
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-300"
                    placeholder="Tell us why you'd like to work with us or any other relevant information..."
                  />
                </div>

                <div className="text-center pt-6">
                  <Button 
                    type="submit"
                    className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white px-8 py-4 rounded-lg transition-all duration-300 hover:shadow-xl transform hover:scale-105 text-lg font-bold"
                  >
                    <Send className="mr-2 h-5 w-5" />
                    Submit Application
                  </Button>
                  <p className="text-sm text-gray-600 mt-3">
                    Your application details will be sent to our HR team via WhatsApp
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How to Apply */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16 scroll-animate" style={{ opacity: 0, transform: 'translateY(32px)' }}>
            <h2 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4 text-gray-900">Application Process</h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Here's what happens after you submit your application
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <Card className="p-6 md:p-8 text-center shadow-lg border-0 hover:-translate-y-2 transition-all duration-300 scroll-animate bg-white" style={{ opacity: 0, transform: 'scale(0.95)', transitionDelay: '100ms' }}>
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-purple-600 to-purple-800 text-white p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Application Review</h3>
                <p className="text-gray-600">Our HR team will review your application and contact you within 2-3 business days.</p>
              </CardContent>
            </Card>

            <Card className="p-6 md:p-8 text-center shadow-lg border-0 hover:-translate-y-2 transition-all duration-300 scroll-animate bg-white" style={{ opacity: 0, transform: 'scale(0.95)', transitionDelay: '200ms' }}>
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-purple-900 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Interview Process</h3>
                <p className="text-gray-600">Qualified candidates will be invited for an interview with our medical and administrative team.</p>
              </CardContent>
            </Card>

            <Card className="p-6 md:p-8 text-center shadow-lg border-0 hover:-translate-y-2 transition-all duration-300 scroll-animate bg-white" style={{ opacity: 0, transform: 'scale(0.95)', transitionDelay: '300ms' }}>
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-green-500 to-green-700 text-white p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Welcome Aboard</h3>
                <p className="text-gray-600">Successful candidates will receive an offer letter and begin their journey with Mega Diagnostics.</p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12 scroll-animate" style={{ opacity: 0, transform: 'translateY(32px)' }}>
            <Card className="p-8 shadow-xl border-0 bg-gradient-to-br from-purple-600 to-purple-800 text-white max-w-2xl mx-auto">
              <CardContent className="p-0">
                <h3 className="text-2xl font-bold mb-4">Need More Information?</h3>
                <p className="mb-6 text-lg">Contact our HR department directly</p>
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2">
                    <Mail className="h-5 w-5" />
                    <span className="text-lg">careers@megadiagnostics.com</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Phone className="h-5 w-5" />
                    <span className="text-lg">+91 9351411126</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MegaCareers;