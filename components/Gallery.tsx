"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const galleryItems = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&q=80&w=1000",
    alt: "Kids playing together outdoors",
    category: "Outdoor Fun",
    className: "md:col-span-2 md:row-span-2",
    bgColor: "#9dcedc",
    borderColor: "border-[#7209B7]",
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&q=80&w=500",
    alt: "Child painting with bright colors",
    category: "Creative Arts",
    className: "md:col-span-1 md:row-span-1",
    bgColor: "#fad06e",
    borderColor: "border-[#fad06e]",
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?auto=format&fit=crop&q=80&w=500",
    alt: "Learning with blocks and toys",
    category: "Early Learning",
    className: "md:col-span-1 md:row-span-2",
    bgColor: "#f7a7b4",
    borderColor: "border-[#06D6A0]",
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1472162072942-cd5147eb3902?auto=format&fit=crop&q=80&w=500",
    alt: "Group reading time together",
    category: "Story Time",
    className: "md:col-span-1 md:row-span-1",
    bgColor: "#06D6A0",
    borderColor: "border-[#9dcedc]",
  },
  {
    id: 5,
    src: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&q=80&w=1000",
    alt: "Playground adventures",
    category: "Adventures",
    className: "md:col-span-2 md:row-span-1",
    bgColor: "#7209B7",
    borderColor: "border-[#fad06e]",
  },
  {
    id: 6,
    src: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&q=80&w=500",
    alt: "Music and movement class",
    category: "Music & Dance",
    className: "md:col-span-2 md:row-span-1",
    bgColor: "#fad06e",
    borderColor: "border-[#7209B7]",
  },
];

const GallerySection = () => {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <section className="bg-white font-sans " id="gallery">
      
      {/* FONTS & STYLES */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Pacifico&display=swap');
        .font-calligraphy { font-family: 'Pacifico', cursive; }
        .font-hand { font-family: 'Dancing Script', cursive; }
      `}</style>

      {/* SECTION HEADER */}
      <div className=" bg-[#90c8d5] mx-auto py-6 px-6  text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex  items-center justify-center gap-2 ">
         
            <span className="bg-[#f7a7b4] text-white px-6 py-2 font-bold text-sm uppercase tracking-widest rounded-full inline-block">
              Our Gallery
            </span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-black text-gray-800 mb-4">
            Capturing <span className="text-[#7209B7]">Joyful</span> Moments
          </h2>
          
          <p className="text-xl text-gray-600 font-medium max-w-2xl mx-auto">
            Every day is filled with laughter, discovery, and precious memories
          </p>
        </motion.div>
      </div>

      {/* BENTO GRID */}
      <div className="max-w-[1920px] bg-[#f7a7b4] py-12 mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[280px] gap-4">
          {galleryItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative group rounded-3xl overflow-hidden cursor-pointer ${item.className}`}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                boxShadow: hoveredId === item.id 
                  ? '0 20px 40px rgba(0,0,0,0.15)' 
                  : '0 4px 20px rgba(0,0,0,0.08)'
              }}
            >
              {/* Image */}
              <motion.div
                className="w-full h-full"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.4 }}
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  className="w-full h-full object-cover"
                />
              </motion.div>

              {/* Colored Border Accent */}
              <div 
              className={`absolute inset-0 border-4  pointer-events-none ${item.borderColor}`}
                style={{ borderRadius: 'inherit' }}
              />

              {/* Hover Overlay */}
              <AnimatePresence>
                {hoveredId === item.id && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6"
                  >
                    {/* Category Badge */}
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="inline-block self-start px-4 py-2 rounded-full font-bold text-white text-sm mb-3"
                      style={{ backgroundColor: item.bgColor }}
                    >
                      {item.category}
                    </motion.div>

                    {/* Description */}
                    <motion.p
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-white font-bold text-lg leading-tight"
                    >
                      {item.alt}
                    </motion.p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      
    </section>
  );
};

export default GallerySection;