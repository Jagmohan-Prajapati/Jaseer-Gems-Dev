import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-outline-variant/20">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 px-6 md:px-12 py-16 w-full max-w-7xl mx-auto">
        {/* Brand */}
        <div className="space-y-6">
          <Link to="/" className="text-3xl font-headline italic tracking-tight text-primary">
            JaseerGems
          </Link>
          <p className="font-body font-light text-sm text-on-surface-variant leading-relaxed">
            Trusted gemstone sourcing with 10 years of experience in rough gems manufacturing and trading.
          </p>
          <p className="font-body font-light text-xs uppercase tracking-[0.14em] text-on-surface-variant/80">
            Bangkok-based • Serving customers globally
          </p>
        </div>

        {/* Quick Links */}
        <div className="space-y-6">
          <h4 className="font-label text-[10px] uppercase tracking-[0.3em] text-primary">Quick Links</h4>
          <ul className="space-y-4">
            <li>
              <Link to="/shop" className="font-body font-light text-xs uppercase tracking-[0.1em] text-on-surface-variant hover:text-primary transition-colors">
                Shop
              </Link>
            </li>
            <li>
              <Link to="/about" className="font-body font-light text-xs uppercase tracking-[0.1em] text-on-surface-variant hover:text-primary transition-colors">
                About
              </Link>
            </li>
            <li>
              <Link to="/contact" className="font-body font-light text-xs uppercase tracking-[0.1em] text-on-surface-variant hover:text-primary transition-colors">
                Contact
              </Link>
            </li>
            <li>
              <Link to="/account" className="font-body font-light text-xs uppercase tracking-[0.1em] text-on-surface-variant hover:text-primary transition-colors">
                My Account
              </Link>
            </li>
          </ul>
        </div>

        {/* Policies */}
        <div className="space-y-6">
          <h4 className="font-label text-[10px] uppercase tracking-[0.3em] text-primary">Policies</h4>
          <ul className="space-y-4">
            <li>
              <Link to="/privacy-policy" className="font-body font-light text-xs uppercase tracking-[0.1em] text-on-surface-variant hover:text-primary transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/refund-policy" className="font-body font-light text-xs uppercase tracking-[0.1em] text-on-surface-variant hover:text-primary transition-colors">
                Refund Policy
              </Link>
            </li>
            <li>
              <Link to="/shipping-policy" className="font-body font-light text-xs uppercase tracking-[0.1em] text-on-surface-variant hover:text-primary transition-colors">
                Shipping Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div className="space-y-6">
          <h4 className="font-label text-[10px] uppercase tracking-[0.3em] text-primary">Contact</h4>
          <div className="space-y-4 text-on-surface-variant font-body font-light text-sm">
            <p className="flex items-start gap-3 leading-relaxed">
              <MapPin size={16} className="mt-0.5 text-primary shrink-0" />
              <span>
                No. 3/2, TRD Building, Room 201, 2nd Floor, Soi Pramote 3, Mahesak Road,
                Suriyawong Subdistrict, Bang Rak District, Bangkok 10500.
              </span>
            </p>

            <a
              href="mailto:jaseergems@gmail.com"
              className="flex items-center gap-3 hover:text-primary transition-colors break-all"
            >
              <Mail size={16} className="text-primary shrink-0" />
              <span>jaseergems@gmail.com</span>
            </a>

            <a
              href="tel:+66959856297"
              className="flex items-center gap-3 hover:text-primary transition-colors"
            >
              <Phone size={16} className="text-primary shrink-0" />
              <span>+66 959856297</span>
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-outline-variant/10 py-6 px-6 md:px-12 text-center">
        <p className="font-body font-light text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/70">
          © 2026 JaseerGems. All rights reserved.
        </p>
      </div>
    </footer>
  );
}