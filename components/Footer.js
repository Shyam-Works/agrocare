// components/Footer.js

import React from "react";
import { Twitter, Facebook, Instagram, Mail, Phone } from "lucide-react";

const Footer = () => {
  const sections = [
    {
      title: "Services",
      links: [
        { name: "Plant Identification", href: "/identification" },
        { name: "Disease Diagnosis", href: "/disease-diagnosis" },
        { name: "Smart Dashboard", href: "/dashboard" },
        { name: "Curated Marketplace", href: "/essentials" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "/about" },
        { name: "Our Mission", href: "/OurMission" },
        { name: "Careers", href: "/Careers" },
        { name: "Blog", href: "/Blog" },
      ],
    },
    {
      title: "Support",
      links: [
        { name: "Contact Us", href: "/contact" },
        { name: "FAQs", href: "/faq" },
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms of Service", href: "/terms" },
      ],
    },
  ];

  return (
    <footer className="bg-[#f0ead2] text-[#283618] border-t-8 border-[#b38a58]">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-8 lg:py-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 lg:gap-8">
          {/* Logo + Social */}
          <div className="col-span-2 md:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-9 h-9 object-contain"
              />
              <span
                className="text-3xl font-bold tracking-tight text-[#283618]"
                style={{
                  fontFamily: '"Open Sans", sans-serif',
                  fontWeight: 900,
                }}
              >
                Agrocare
              </span>
            </div>

            <p className="text-sm text-[#283618] opacity-80 max-w-xs leading-snug">
              Empowering sustainable agriculture through cutting-edge AI
              technology.
            </p>

            {/* Social Links */}
            <div className="flex space-x-3 pt-1">
              <a href="#" aria-label="Facebook" className="hover:text-white">
                <Facebook className="w-5 h-5 text-[#283618]" />
              </a>
              <a href="#" aria-label="Twitter" className="hover:text-white">
                <Twitter className="w-5 h-5 text-[#283618]" />
              </a>
              <a href="#" aria-label="Instagram" className="hover:text-white">
                <Instagram className="w-5 h-5 text-[#283618]" />
              </a>
            </div>
          </div>

          {/* Sections */}
          {sections.map((section) => (
            <div key={section.title} className="space-y-3">
              <h4 className="text-md font-bold text-[#283618] uppercase tracking-wider">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-sm text-[#283618] opacity-80 hover:text-white transition-all"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-6 border-t border-[#b38a58]/50 flex flex-col md:flex-row justify-between items-center text-sm text-[#283618] opacity-80">
          <p className="mb-3 md:mb-0 text-[#283618]">
            &copy; {new Date().getFullYear()} Agrocare. All rights reserved.
          </p>
          <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-4">
            <a
              href="mailto:support@agrocare.com"
              className="hover:text-white flex items-center text-[#283618]"
            >
              <Mail className="w-4 h-4 mr-1 text-[#283618]" />
              support@agrocare.com
            </a>
            <a
              href="tel:+1-555-AGROCARE"
              className="hover:text-white flex items-center text-[#283618]"
            >
              <Phone className="w-4 h-4 mr-1 text-[#283618]" />
              +1 (555) AGROCARE
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;