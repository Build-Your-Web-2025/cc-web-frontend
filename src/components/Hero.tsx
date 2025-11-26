"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Calendar, MessageSquare } from "lucide-react";

const words = ["Connect", "Collaborate", "Contribute"];

export function Hero() {
  const [currentWord, setCurrentWord] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative py-20 md:py-32 lg:py-40">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center rounded-full border bg-background px-4 py-1.5 text-sm font-medium shadow-sm">
            <span className="mr-2 h-2 w-2 rounded-full bg-green-500"></span>
            Built for Your Campus
          </div>

          {/* Main Headline */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            <div className="mb-6">Your Space to</div>
            <div className="relative inline-block h-[1.2em]">
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentWord}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="absolute left-1/2 -translate-x-1/2 bg-linear-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent"
                >
                  {words[currentWord]}
                </motion.span>
              </AnimatePresence>
            </div>
          </h1>

          {/* Description */}
          <p className="mb-10 text-lg text-neutral-500/70  max-w-2xl mx-auto sm:text-xl md:text-2xl">
            A community space for students to express ideas, post updates, and
            take part in events that bring the campus together.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="gap-2 text-base" asChild>
              <Link href="/register">
                Get Started for Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-base" asChild>
              <Link href="/about">Learn More</Link>
            </Button>
          </div>

          {/* Feature Pills */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 rounded-full bg-muted px-4 py-2">
              <MessageSquare className="h-4 w-4" />
              <span>Real-time Posts</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-muted px-4 py-2">
              <Calendar className="h-4 w-4" />
              <span>Campus Events</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-muted px-4 py-2">
              <Users className="h-4 w-4" />
              <span>Group Collaboration</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
