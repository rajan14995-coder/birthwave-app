import Link from 'next/link';
import { Facebook, Instagram, Youtube, Linkedin, Phone, Mail, MapPin, Clock } from 'lucide-react';

export default function MarketingFooter() {
  return (
    <footer className="bg-gray-900 px-4 sm:px-6 lg:px-8 py-16 text-gray-300">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4 lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-400 text-white font-black text-base flex items-center justify-center">
                BW
              </span>
              <span className="text-lg font-bold text-white">
                Birth<span className="text-rose-400">Wave</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              The Holistic Women Wellness Space — obstetrics, gynaecology, fertility, and postpartum
              care in Nungambakkam, Chennai.
            </p>
            <div className="flex gap-3 pt-1">
              <a href="https://www.facebook.com/thebirthwave" aria-label="Facebook" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-rose-600 transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="https://www.instagram.com/thebirthwave" aria-label="Instagram" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-rose-600 transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="https://www.youtube.com/@birthtoremember" aria-label="YouTube" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-rose-600 transition-colors">
                <Youtube className="h-4 w-4" />
              </a>
              <a href="https://www.linkedin.com/in/dr-santoshi-nandigam-3b90bb78" aria-label="LinkedIn" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-rose-600 transition-colors">
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <p className="mb-4 text-sm font-bold text-white uppercase tracking-wider">Quick Links</p>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="#doctors" className="hover:text-white transition-colors">Our Doctors</Link></li>
              <li><Link href="#services" className="hover:text-white transition-colors">Specialities</Link></li>
              <li><Link href="#faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/patient/login" className="hover:text-white transition-colors">Patient Portal</Link></li>
            </ul>
          </div>

          <div>
            <p className="mb-4 text-sm font-bold text-white uppercase tracking-wider">Our Specialities</p>
            <ul className="space-y-2.5 text-sm">
              <li>Gynaecology &amp; Fertility</li>
              <li>Pregnancy &amp; Childbirth</li>
              <li>Postpartum &amp; Lactation</li>
              <li>Pediatric Care</li>
              <li>Pelvic Floor Therapy</li>
            </ul>
          </div>

          <div>
            <p className="mb-4 text-sm font-bold text-white uppercase tracking-wider">Contact Info</p>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <Phone className="h-4 w-4 mt-0.5 text-rose-400 shrink-0" />
                <a href="tel:+919363031925" className="hover:text-white transition-colors">93630 31925</a>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="h-4 w-4 mt-0.5 text-rose-400 shrink-0" />
                <a href="mailto:drsantoshi@thebirthwave.com" className="hover:text-white transition-colors break-all">
                  drsantoshi@thebirthwave.com
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 mt-0.5 text-rose-400 shrink-0" />
                <span>No 8/15 Mahalingapuram Main Road, Nungambakkam, Chennai 600034</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="h-4 w-4 mt-0.5 text-rose-400 shrink-0" />
                <span>Open: Monday – Sunday, 7:30 AM – 9 PM</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} The BirthWave. All rights reserved.</p>
          <p>Nungambakkam, Chennai, Tamil Nadu</p>
        </div>
      </div>
    </footer>
  );
}
