"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  CheckCircle, 
  HelpCircle, 
  MapPin, 
  Phone, 
  Mail, 
  Baby, 
  Calendar, 
  MessageCircle,
  Sparkles,
  ArrowRight
} from "lucide-react";

const EnrollmentPage = () => {
  const [formType, setFormType] = useState<"enroll" | "enquiry">("enroll");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Mock submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate network request
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen  bg-gradient-to-b from-white via-[#FFF9F0] to-white relative overflow-hidden pt-[180px] pb-20">
      
      {/* --- Background Elements (Consistent with Hero) --- */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}
      />
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-[#A7D8FF]/10 to-transparent -z-10" />
      <div className="absolute top-40 right-10 w-64 h-64 bg-[#FFE99B]/20 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-20 left-10 w-72 h-72 bg-[#FF8A80]/10 rounded-full blur-3xl -z-10" />

      <div className="container mx-auto px-4 relative z-10">
        
        {/* --- Page Header --- */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#B8F3D1]/30 text-emerald-700 rounded-full text-sm font-bold uppercase tracking-wider mb-4 border border-[#B8F3D1]/50">
            <Sparkles className="w-4 h-4" />
            Admissions Open 2024-25
          </div>
          <h1 className="text-4xl lg:text-6xl font-fedorikanew text-gray-800 mb-6">
            Join Our <span className="text-[#FF8A80] relative">
              Family
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-[#FFE99B] -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
              </svg>
            </span>
          </h1>
          <p className="text-lg text-gray-600">
            Whether you're ready to enroll or just have a few questions, we're excited to hear from you.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* --- Left Column: The Form --- */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7"
          >
            <Card className="border-none shadow-xl shadow-gray-200/50 bg-white/80 backdrop-blur-sm overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-[#FF8A80] via-[#FFE99B] to-[#A7D8FF]" />
              <CardHeader>
                <div className="flex gap-4 mb-6 p-1 bg-gray-100/80 rounded-xl w-fit">
                  <button
                    onClick={() => setFormType("enroll")}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                      formType === "enroll" 
                        ? "bg-white text-[#FF8A80] shadow-sm" 
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Enrollment Application
                  </button>
                  <button
                    onClick={() => setFormType("enquiry")}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                      formType === "enquiry" 
                        ? "bg-white text-[#A7D8FF] shadow-sm" 
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Ask an Enquiry
                  </button>
                </div>
                <CardTitle className="text-2xl text-gray-800">
                  {formType === "enroll" ? "Little Dreamers Application" : "How can we help?"}
                </CardTitle>
                <CardDescription>
                  {formType === "enroll" 
                    ? "Please fill out the details below to start the admission process." 
                    : "Send us your questions and our team will get back to you shortly."}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {isSuccess ? (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="py-12 text-center space-y-4"
                  >
                    <div className="w-20 h-20 bg-[#B8F3D1] text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">Thank You!</h3>
                    <p className="text-gray-600 max-w-xs mx-auto">
                      We've received your {formType === "enroll" ? "application" : "enquiry"}. 
                      Our team will contact you within 24 hours.
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsSuccess(false)}
                      className="mt-4"
                    >
                      Send Another
                    </Button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Parent's Name</label>
                        <input 
                          required
                          type="text" 
                          placeholder="John Doe"
                          className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#FF8A80] focus:ring-2 focus:ring-[#FF8A80]/20 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Email Address</label>
                        <input 
                          required
                          type="email" 
                          placeholder="john@example.com"
                          className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#FF8A80] focus:ring-2 focus:ring-[#FF8A80]/20 outline-none transition-all"
                        />
                      </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Phone Number</label>
                        <input 
                          required
                          type="tel" 
                          placeholder="+1 (555) 000-0000"
                          className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#FF8A80] focus:ring-2 focus:ring-[#FF8A80]/20 outline-none transition-all"
                        />
                      </div>
                      
                      {formType === "enroll" && (
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">Child's Name</label>
                          <input 
                            required
                            type="text" 
                            placeholder="Jane Doe"
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#FF8A80] focus:ring-2 focus:ring-[#FF8A80]/20 outline-none transition-all"
                          />
                        </div>
                      )}
                    </motion.div>

                    <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Program Interest</label>
                        <div className="relative">
                          <select className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#FF8A80] focus:ring-2 focus:ring-[#FF8A80]/20 outline-none transition-all appearance-none text-gray-600">
                            <option>Toddler Playgroup (1.5 - 2.5 yrs)</option>
                            <option>Preschool (2.5 - 4 yrs)</option>
                            <option>Kindergarten (4 - 6 yrs)</option>
                            <option>After School Care</option>
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </div>
                        </div>
                      </div>
                      
                      {formType === "enroll" && (
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">Child's Date of Birth</label>
                          <input 
                            required
                            type="date" 
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#FF8A80] focus:ring-2 focus:ring-[#FF8A80]/20 outline-none transition-all text-gray-600"
                          />
                        </div>
                      )}
                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">
                        {formType === "enroll" ? "Any special requirements or questions?" : "Your Message"}
                      </label>
                      <textarea 
                        rows={4}
                        placeholder={formType === "enroll" ? "Allergies, special needs, or specific questions..." : "How can we help you today?"}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#FF8A80] focus:ring-2 focus:ring-[#FF8A80]/20 outline-none transition-all resize-none"
                      />
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full py-6 text-lg font-bold bg-[#FF8A80] hover:bg-[#ff7566] text-white rounded-xl shadow-lg shadow-[#FF8A80]/20 transition-all hover:shadow-xl hover:-translate-y-0.5"
                      >
                        {isSubmitting ? (
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Sending...
                          </span>
                        ) : (
                          formType === "enroll" ? "Submit Application" : "Send Enquiry"
                        )}
                      </Button>
                    </motion.div>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* --- Right Column: Info & Contact --- */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-5 space-y-8"
          >
            {/* Info Card */}
            <div className="bg-[#A7D8FF]/10 rounded-3xl p-8 border border-[#A7D8FF]/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#A7D8FF]/20 rounded-bl-full -z-0" />
              
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-[#A7D8FF]" />
                Contact Information
              </h3>
              
              <div className="space-y-6 relative z-10">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm text-[#FF8A80]">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-semibold">Call Us</p>
                    <p className="text-lg font-bold text-gray-800">+1 (555) 123-4567</p>
                    <p className="text-xs text-gray-500">Mon - Fri, 8am - 5pm</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm text-[#A7D8FF]">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-semibold">Email Us</p>
                    <p className="text-lg font-bold text-gray-800">hello@littledreamers.edu</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm text-[#FFE99B] text-amber-400">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-semibold">Visit Us</p>
                    <p className="text-gray-800 font-medium">123 Sunshine Avenue,</p>
                    <p className="text-gray-800 font-medium">Happy Valley, CA 90210</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Process Timeline */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-lg shadow-gray-200/30">
              <h3 className="text-xl font-bold text-gray-800 mb-6">What Happens Next?</h3>
              <div className="space-y-8 relative">
                {/* Connector Line */}
                <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gray-100" />

                {[
                  { icon: MessageCircle, title: "Submit Form", desc: "Fill out the details to start." },
                  { icon: Calendar, title: "Schedule Tour", desc: "Visit our campus & meet teachers." },
                  { icon: Baby, title: "Registration", desc: "Complete paperwork & welcome!" },
                ].map((step, idx) => (
                  <div key={idx} className="flex gap-4 relative">
                    <div className="w-10 h-10 bg-[#FFF9F0] border-2 border-[#FFE99B] rounded-full flex items-center justify-center shrink-0 z-10">
                      <step.icon className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">{step.title}</h4>
                      <p className="text-sm text-gray-500">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Why Choose Us Mini */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-[#FF8A80] to-[#ff6b5e] text-white shadow-lg shadow-[#FF8A80]/30">
              <h3 className="text-xl font-bold mb-4">Why Parents Love Us</h3>
              <ul className="space-y-3">
                {[
                  "Low student-teacher ratio",
                  "Organic nutritious meals",
                  "Large outdoor play area"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm font-medium opacity-90">
                    <CheckCircle className="w-4 h-4 text-[#FFE99B]" />
                    {item}
                  </li>
                ))}
              </ul>
              <button className="mt-6 w-full py-3 bg-white text-[#FF8A80] rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 group">
                Download Brochure
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentPage;