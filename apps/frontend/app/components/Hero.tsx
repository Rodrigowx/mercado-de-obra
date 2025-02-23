// app/components/Hero.tsx
"use client";

import React from "react";

interface HeroProps {
  title: string;
  subtitle: string;
}

const Hero: React.FC<HeroProps> = ({ title, subtitle }) => {
  return (
    <section className="bg-gray-100 dark:bg-secondary text-gray-800 dark:text-tertiary my-2">
      <div className="container mx-auto text-center">
        <h1 className="text-3xl font-bold mb-3">{title}</h1>
        <p className="text-md text-gray-600 dark:text-gray-300">{subtitle}</p>
      </div>
    </section>
  );
};

export default Hero;
