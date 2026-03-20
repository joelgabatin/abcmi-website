"use client"

import Link from "next/link"
import { Mail, Phone, MapPin, Globe } from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface ContactSettings {
  address: string
  phone: string
  email: string
  facebook_url: string
  youtube_url: string
  instagram_url: string
}

const quickLinks = [
  { name: "About Us", href: "/about" },
  { name: "Ministries", href: "/ministries" },
  { name: "Service Schedules", href: "/services" },
  { name: "Events", href: "/events" },
  { name: "Donate", href: "/donate" },
]

const connectLinks = [
  { name: "Prayer Request", href: "/prayer-request" },
  { name: "Counseling", href: "/counseling" },
  { name: "Bible Study", href: "/bible-study" },
  { name: "Daily Devotional", href: "/bible-reading" },
  { name: "Feedback", href: "/feedback" },
]

const defaults: ContactSettings = {
  address: "Quirino Hill, Baguio City, Philippines",
  phone: "+63 912 345 6789",
  email: "info@abcmi.org",
  facebook_url: "",
  youtube_url: "",
  instagram_url: "",
}

export function Footer() {
  const [contact, setContact] = useState<ContactSettings>(defaults)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from("site_settings")
      .select("value")
      .eq("key", "contact")
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value) {
          setContact({ ...defaults, ...(data.value as Partial<ContactSettings>) })
        }
      })
  }, [])

  return (
    <footer className="bg-[var(--church-dark-text)] text-white">
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Church Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[var(--church-primary)] flex items-center justify-center">
                <span className="text-white font-bold">AB</span>
              </div>
              <div>
                <h3 className="font-bold text-lg">Arise and Build</h3>
                <p className="text-sm text-gray-400">For Christ Ministries Inc.</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              A faith-centered community dedicated to spreading the Gospel, nurturing believers, and building disciples for Christ.
            </p>
            <div className="flex gap-3">
              {contact.facebook_url && (
                <a
                  href={contact.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[var(--church-primary)] transition-colors"
                  aria-label="Facebook"
                >
                  <Globe className="w-5 h-5" />
                </a>
              )}
              {contact.youtube_url && (
                <a
                  href={contact.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[var(--church-primary)] transition-colors"
                  aria-label="YouTube"
                >
                  <Globe className="w-5 h-5" />
                </a>
              )}
              {contact.instagram_url && (
                <a
                  href={contact.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[var(--church-primary)] transition-colors"
                  aria-label="Instagram"
                >
                  <Globe className="w-5 h-5" />
                </a>
              )}
              {contact.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[var(--church-primary)] transition-colors"
                  aria-label="Email"
                >
                  <Mail className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-[var(--church-primary)] transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="font-bold text-lg mb-4">Connect</h3>
            <ul className="space-y-2">
              {connectLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-[var(--church-primary)] transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3">
              {contact.address && (
                <li className="flex items-start gap-3 text-gray-400 text-sm">
                  <MapPin className="w-5 h-5 shrink-0 text-[var(--church-primary)]" />
                  <span>{contact.address}</span>
                </li>
              )}
              {contact.phone && (
                <li className="flex items-center gap-3 text-gray-400 text-sm">
                  <Phone className="w-5 h-5 shrink-0 text-[var(--church-primary)]" />
                  <span>{contact.phone}</span>
                </li>
              )}
              {contact.email && (
                <li className="flex items-center gap-3 text-gray-400 text-sm">
                  <Mail className="w-5 h-5 shrink-0 text-[var(--church-primary)]" />
                  <span>{contact.email}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm text-center md:text-left">
            &copy; {new Date().getFullYear()} Arise and Build For Christ Ministries Inc. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-gray-400">
            <Link href="/privacy" className="hover:text-[var(--church-primary)]">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[var(--church-primary)]">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
