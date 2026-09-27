'use client';
import MegaDiagnosticsNavbar from '../navbar/navbar';
import React, { useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Lock, 
  Eye, 
  Users, 
  FileText, 
  Mail, 
  Phone, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Globe, 
  Database, 
  Key, 
  UserCheck, 
  Settings,
  Heart,
  Building2,
  Calendar,
  MapPin,
  Sparkles
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

const MegaPrivacyPolicy = () => {
  useScrollAnimation();

  const privacySections = [
    {
      title: 'Information We Collect',
      icon: Database,
      content: [
        {
          subtitle: 'Personal Information',
          text: 'We collect personal information that you voluntarily provide to us when you register for our services, schedule appointments, or contact us. This may include your name, email address, phone number, date of birth, address, and medical information necessary for providing diagnostic services.'
        },
        {
          subtitle: 'Medical Information',
          text: 'As a healthcare provider, we collect and maintain medical records, test results, diagnostic reports, and other health-related information necessary for providing quality healthcare services and maintaining continuity of care.'
        },
        {
          subtitle: 'Technical Information',
          text: 'We automatically collect certain technical information when you visit our website, including your IP address, browser type, operating system, and browsing patterns to improve our website functionality and user experience.'
        }
      ]
    },
    {
      title: 'How We Use Your Information',
      icon: Settings,
      content: [
        {
          subtitle: 'Healthcare Services',
          text: 'We use your personal and medical information primarily to provide diagnostic services, generate test reports, maintain medical records, and ensure continuity of care between healthcare providers.'
        },
        {
          subtitle: 'Communication',
          text: 'We may use your contact information to communicate with you about appointments, test results, follow-up care, and important updates about our services or policies.'
        },
        {
          subtitle: 'Quality Improvement',
          text: 'We analyze aggregated and anonymized data to improve our services, enhance patient safety, and advance medical research while maintaining strict confidentiality protocols.'
        }
      ]
    },
    {
      title: 'Information Sharing',
      icon: Users,
      content: [
        {
          subtitle: 'Healthcare Providers',
          text: 'We may share your medical information with your referring physicians, specialists, or other healthcare providers involved in your care, as authorized by you or as required for continuity of care.'
        },
        {
          subtitle: 'Legal Requirements',
          text: 'We may disclose your information when required by law, court order, or government regulation, or when necessary to protect public health or safety, or to comply with medical reporting requirements.'
        },
        {
          subtitle: 'Service Providers',
          text: 'We may share limited information with trusted third-party service providers who assist us in operating our facility, conducting business, or servicing you, provided they maintain confidentiality.'
        }
      ]
    },
    {
      title: 'Data Security',
      icon: Lock,
      content: [
        {
          subtitle: 'Technical Safeguards',
          text: 'We implement robust technical security measures including encryption, secure servers, firewalls, and access controls to protect your personal and medical information from unauthorized access or disclosure.'
        },
        {
          subtitle: 'Physical Security',
          text: 'Our facilities maintain strict physical security measures including controlled access areas, secure storage systems, and surveillance to protect sensitive information and medical records.'
        },
        {
          subtitle: 'Administrative Controls',
          text: 'We have comprehensive policies and procedures governing data access, employee training, and incident response to ensure your information is handled with the highest level of security and confidentiality.'
        }
      ]
    },
    {
      title: 'Your Rights',
      icon: UserCheck,
      content: [
        {
          subtitle: 'Access and Review',
          text: 'You have the right to access, review, and request copies of your medical records and personal information we maintain, subject to applicable laws and regulations.'
        },
        {
          subtitle: 'Correction and Updates',
          text: 'You may request corrections to inaccurate or incomplete personal information. For medical records, we follow established medical record amendment procedures.'
        },
        {
          subtitle: 'Communication Preferences',
          text: 'You can opt out of non-essential communications and marketing materials. However, we may still need to contact you regarding essential healthcare-related matters.'
        }
      ]
    },
    {
      title: 'Retention and Disposal',
      icon: Clock,
      content: [
        {
          subtitle: 'Retention Period',
          text: 'We retain your medical records and personal information for the periods required by applicable laws and professional standards, typically 7-10 years from the date of last service or as required by medical practice standards.'
        },
        {
          subtitle: 'Secure Disposal',
          text: 'When information is no longer required to be retained, we securely dispose of it using methods that ensure complete destruction and prevent unauthorized recovery or reconstruction.'
        }
      ]
    }
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
          <Shield className="h-6 w-6 md:h-8 md:w-8" />
        </div>
        <div className="absolute top-20 right-8 md:top-32 md:right-16 text-white/10 animate-pulse">
          <Lock className="h-4 w-4 md:h-6 md:w-6" />
        </div>
        <div className="absolute bottom-10 left-8 md:bottom-20 md:left-20 text-white/10 animate-bounce" style={{animationDelay: '1s'}}>
          <FileText className="h-8 w-8 md:h-10 md:w-10" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="scroll-animate" style={{ opacity: 0, transform: 'translateY(32px)' }}>
            <div className="inline-flex items-center gap-2 md:gap-3 mb-4 md:mb-6 bg-white/10 backdrop-blur-sm rounded-full px-4 md:px-6 py-2 md:py-3">
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-2 md:p-3 rounded-full">
                <Shield className="h-5 w-5 md:h-8 md:w-8 text-purple-900" />
              </div>
              <h1 className="text-xl md:text-5xl font-bold">Privacy Policy</h1>
            </div>
            <p className="text-base md:text-xl max-w-4xl mx-auto mb-6 md:mb-8 leading-relaxed px-4">
              Your privacy and the security of your personal health information is our top priority. 
              Learn how we collect, use, and protect your information.
            </p>
            <div className="inline-block bg-gradient-to-r from-yellow-400 to-yellow-500 px-4 md:px-8 py-2 md:py-3 rounded-full text-purple-900 font-bold text-sm md:text-lg shadow-lg">
              <Sparkles className="inline h-4 w-4 md:h-5 md:w-5 mr-2" />
              LAST UPDATED: AUGUST 2025
            </div>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-xl border-0 scroll-animate bg-gradient-to-br from-white to-gray-50" style={{ opacity: 0, transform: 'translateY(32px)' }}>
            <CardContent className="p-8 md:p-12">
              <div className="text-center mb-8">
                <div className="bg-gradient-to-br from-purple-600 to-purple-800 text-white p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg">
                  <Heart className="h-8 w-8" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Our Commitment to Your Privacy</h2>
              </div>
              
              <div className="prose max-w-none text-gray-700 leading-relaxed space-y-4">
                <p className="text-lg">
                  At <strong>Mega Diagnostics</strong>, we are committed to protecting your privacy and maintaining the confidentiality of your personal health information. As a healthcare provider, we understand the sensitive nature of medical information and the importance of maintaining your trust.
                </p>
                
                <p>
                  This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our facility, use our services, or interact with our website. We comply with all applicable privacy laws and regulations, including healthcare privacy standards and data protection requirements.
                </p>
                
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-lg border-l-4 border-purple-600 my-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-purple-900 mb-2">HIPAA Compliance</p>
                      <p className="text-purple-800">
                        We maintain strict compliance with healthcare privacy regulations and industry best practices to ensure your medical information is protected at all times.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Privacy Sections */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid gap-8 md:gap-12">
            {privacySections.map((section, index) => (
              <Card key={index} className="shadow-lg border-0 hover:shadow-xl transition-all duration-300 scroll-animate bg-white" style={{ opacity: 0, transform: 'translateY(32px)', transitionDelay: `${index * 100}ms` }}>
                <CardContent className="p-8 md:p-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-gradient-to-br from-purple-600 to-purple-800 text-white p-3 rounded-full shadow-lg">
                      <section.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900">{section.title}</h3>
                  </div>
                  
                  <div className="space-y-6">
                    {section.content.map((item, itemIndex) => (
                      <div key={itemIndex} className="border-l-4 border-purple-200 pl-6">
                        <h4 className="text-lg font-bold text-gray-900 mb-2">{item.subtitle}</h4>
                        <p className="text-gray-700 leading-relaxed">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 scroll-animate" style={{ opacity: 0, transform: 'translateY(32px)' }}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Questions About This Policy?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              If you have any questions about this Privacy Policy or our privacy practices, please contact us.
            </p>
          </div>

          <Card className="shadow-xl border-0 scroll-animate bg-gradient-to-br from-purple-600 to-purple-800 text-white" style={{ opacity: 0, transform: 'translateY(32px)' }}>
            <CardContent className="p-8 md:p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="text-center md:text-left">
                  <h3 className="text-xl font-bold mb-4">Privacy Officer</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-center md:justify-start gap-3">
                      <Building2 className="h-5 w-5" />
                      <span>Mega Diagnostics</span>
                    </div>
                    <div className="flex items-center justify-center md:justify-start gap-3">
                      <Mail className="h-5 w-5" />
                      <span>privacy@megadiagnostics.com</span>
                    </div>
                    <div className="flex items-center justify-center md:justify-start gap-3">
                      <Phone className="h-5 w-5" />
                      <span>+91 9351411126</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-center md:text-left">
                  <h3 className="text-xl font-bold mb-4">Our Location</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-center md:justify-start gap-3">
                      <MapPin className="h-5 w-5" />
                      <span>Udaipur, Rajasthan</span>
                    </div>
                    <div className="flex items-center justify-center md:justify-start gap-3">
                      <Clock className="h-5 w-5" />
                      <span>Mon-Sat: 8:00 AM - 8:00 PM</span>
                    </div>
                    <div className="flex items-center justify-center md:justify-start gap-3">
                      <Globe className="h-5 w-5" />
                      <span>www.megadiagnostics.com</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t border-white/20 text-center">
                <Button 
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-purple-900 font-bold px-8 py-3 rounded-lg transition-all duration-300 hover:shadow-lg transform hover:scale-105"
                  onClick={() => window.open('mailto:privacy@megadiagnostics.com', '_blank')}
                >
                  <Mail className="mr-2 h-5 w-5" />
                  Contact Privacy Officer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Updates Notice */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-purple-50">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg border-0 scroll-animate bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200" style={{ opacity: 0, transform: 'translateY(32px)' }}>
            <CardContent className="p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900 p-3 rounded-full flex-shrink-0">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-yellow-900 mb-2">Policy Updates</h3>
                  <p className="text-yellow-800 leading-relaxed">
                    We may update this Privacy Policy from time to time to reflect changes in our practices, services, or legal requirements. 
                    We will notify you of any material changes by posting the updated policy on our website and updating the "Last Updated" date. 
                    Your continued use of our services after such changes constitutes acceptance of the updated policy.
                  </p>
                  <p className="text-yellow-800 mt-3 font-medium">
                    Last Updated: August 19, 2025
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default MegaPrivacyPolicy;