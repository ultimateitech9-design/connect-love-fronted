"use client";

import { ContactUsForm } from "@/features/home/ContactUsForm";
import { Footer } from "@/features/home/Footer";
import { Navbar } from "@/features/home/Navbar";

export default function ContactUsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar
        onLoginClick={() => {
          window.location.href = "/login";
        }}
        onSignupClick={() => {
          window.location.href = "/register";
        }}
      />
      <main className="mx-auto w-[90vw] max-w-4xl py-12 md:py-16">
        <ContactUsForm />
      </main>
      <Footer />
    </div>
  );
}
