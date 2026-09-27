'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Mail, Calendar, Eye, Lock, Baby, RefreshCcw, Star, Globe } from 'lucide-react';
import { Luckiest_Guy, Nunito } from 'next/font/google';

const bubbleFont = Luckiest_Guy({ subsets: ['latin'], weight: ['400'] });
const bodyFont = Nunito({ subsets: ['latin'], weight: ['600', '800'] });

// --- CONSISTENT BUBBLE TEXT COMPONENT ---
const BubbleText = ({ text, sizeClass = "text-4xl md:text-6xl" }: { text: string, sizeClass?: string }) => {
  const colors = ['text-blue-500', 'text-red-500', 'text-yellow-500', 'text-green-500', 'text-orange-500', 'text-purple-500'];
  return (
    <div className="flex flex-wrap justify-center gap-x-1">
      {text.split("").map((char, i) => (
        <span
          key={i}
          className={`relative inline-block ${sizeClass} ${bubbleFont.className} ${colors[i % colors.length]} 
          [text-shadow:_3px_3px_0_#000,_-1px_-1px_0_#000,_1px_-1px_0_#000,_-1px_1px_0_#000,_1px_1px_0_#000]`}
        >
          {char}
          {['o', 'e', 'p', 'a', 'd', 'c', 'u'].includes(char.toLowerCase()) && (
            <span className="absolute top-[40%] left-1/2 -translate-x-1/2 flex gap-0.5 lg:gap-1 pointer-events-none">
              <span className="w-0.5 h-0.5 lg:w-1 lg:h-1 bg-black rounded-full" />
              <span className="w-0.5 h-0.5 lg:w-1 lg:h-1 bg-black rounded-full" />
            </span>
          )}
        </span>
      ))}
    </div>
  );
};

function PrivacyPolicyPage() {
  const sections = [
    {
      title: "Information We Collect",
      icon: <Eye />,
      color: "bg-blue-400",
      shadow: "shadow-[8px_8px_0_0_#2563eb]",
      content: "When you visit our platform, we may collect technical details like your IP address and browser type. If you enroll or contact us, we collect personal information such as names and contact details to serve you better."
    },
    {
      title: "How We Use Information",
      icon: <Star />,
      color: "bg-green-400",
      shadow: "shadow-[8px_8px_0_0_#16a34a]",
      content: "We use your information to improve our website, personalize your experience, and communicate updates about our programs. Aggregated data helps us better serve our community."
    },
    {
      title: "Data Security",
      icon: <Lock />,
      color: "bg-rose-400",
      shadow: "shadow-[8px_8px_0_0_#e11d48]",
      content: "We take strict measures to protect your security. While no internet transmission is 100% secure, we use modern safety standards to prevent unauthorized access."
    },
    {
      title: "Children's Privacy",
      icon: <Baby />,
      color: "bg-purple-400",
      shadow: "shadow-[8px_8px_0_0_#9333ea]",
      content: "We do not knowingly collect information from children under 13 without parental consent. If you believe your child has provided us with data, please contact us immediately."
    }
  ];

  return (
    <div className={`min-h-screen bg-[#FFFDF6] ${bodyFont.className} py-20 px-4 md:px-10`}>
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block mb-6"
          >
            <div className="w-20 h-20 bg-yellow-400 border-4 border-black rounded-[2rem] flex items-center justify-center shadow-[6px_6px_0_0_#000] rotate-12 mx-auto">
              <Shield className="w-10 h-10 text-black stroke-[3px]" />
            </div>
          </motion.div>
          <BubbleText text="PRIVACY POLICY And Terms" />
          <p className="text-xl text-slate-600 font-black mt-6 max-w-2xl mx-auto leading-relaxed">
            Your privacy is our priority. We are committed to protecting your information while providing a safe space for early learning.
          </p>
        </div>

        {/* Introduction Block */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-4 border-black rounded-[3rem] p-8 md:p-12 shadow-[12px_12px_0_0_#000] mb-12"
        >
          <p className="text-lg md:text-xl text-slate-700 font-bold leading-relaxed italic text-center">
            "Thank you for trusting <span className="text-blue-500 font-black">Best Preschool and Day Care</span>. We are dedicated to maintaining the highest standards of data protection for all our families and partners."
          </p>
        </motion.div>

        {/* Policy Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
          {sections.map((section, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className={`bg-white border-4 border-black rounded-[2.5rem] p-8 ${section.shadow} group hover:-translate-y-1 transition-all`}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-14 h-14 ${section.color} border-4 border-black rounded-2xl flex items-center justify-center text-white shadow-[4px_4px_0_0_#000]`}>
                  {React.cloneElement(section.icon as React.ReactElement, { size: 28, strokeWidth: 3 })}
                </div>
                <h2 className={`${bubbleFont.className} text-2xl tracking-wide text-slate-800`}>{section.title}</h2>
              </div>
              <p className="text-slate-600 font-bold leading-relaxed">
                {section.content}
              </p>
            </motion.div>
          ))}
        </div>

        {/* External Links & Updates */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16">
          <div className="lg:col-span-7 bg-[#e0f2fe] border-4 border-black rounded-[3rem] p-8 shadow-[10px_10px_0_0_#4D96FF]">
            <div className="flex items-center gap-4 mb-4">
              <Globe className="w-8 h-8 text-blue-600" />
              <h3 className={`${bubbleFont.className} text-2xl`}>Third-Party Links</h3>
            </div>
            <p className="text-slate-700 font-bold leading-relaxed">
              Our website may contain links to other sites. We encourage you to review their privacy policies before sharing any personal information, as we are not responsible for their content or practices.
            </p>
          </div>

          <div className="lg:col-span-5 bg-yellow-50 border-4 border-black rounded-[3rem] p-8 shadow-[10px_10px_0_0_#FFD93D] flex flex-col justify-center">
            <div className="flex items-center gap-4 mb-4">
              <RefreshCcw className="w-8 h-8 text-orange-500" />
              <h3 className={`${bubbleFont.className} text-2xl`}>Policy Updates</h3>
            </div>
            <p className="text-slate-700 font-bold leading-relaxed">
              We may update this policy periodically. Any changes will be posted here with a revised effective date.
            </p>
          </div>
        </div>

        {/* Contact Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="bg-slate-900 border-4 border-black rounded-[3rem] p-10 md:p-14 text-white text-center shadow-[15px_15px_0_0_#000] relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
            <Mail size={120} />
          </div>
          
          <h2 className={`${bubbleFont.className} text-4xl mb-6 tracking-wider`}>CONTACT US</h2>
          <p className="text-xl font-bold mb-10 max-w-2xl mx-auto opacity-90">
            If you have any questions about your information or our privacy practices, please reach out to our team:
          </p>
          
          <a 
            href="mailto:ashishrohilla510@gmail.com" 
            className="inline-flex items-center gap-3 bg-white text-slate-900 px-10 py-4 rounded-2xl border-4 border-black font-black text-xl hover:bg-yellow-400 hover:scale-105 active:scale-95 transition-all shadow-[6px_6px_0_0_#4D96FF]"
          >
            <Mail className="w-6 h-6 stroke-[3px]" />
           info@bestpreschoolanddaycare.com
          </a>
        </motion.div>

        {/* Footer Note */}
        <div className="mt-20 text-center border-t-4 border-black/10 pt-10">
          <div className="inline-flex items-center gap-2 bg-slate-100 px-6 py-2 rounded-full border-2 border-black font-black text-slate-500 uppercase text-xs tracking-widest">
            <Calendar className="w-4 h-4" />
            Last Updated: December 21, 2025
          </div>
        </div>

      </div>
    </div>
  );
}

export default PrivacyPolicyPage;