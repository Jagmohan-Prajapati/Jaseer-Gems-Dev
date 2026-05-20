import { Link } from 'react-router-dom';
import { Share2, Globe, ArrowRight, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-outline-variant/20">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 px-12 py-20 w-full max-w-7xl mx-auto">
        <div className="space-y-8">
          <Link to="/" className="text-3xl font-headline text-primary">JaseerGems</Link>
          <p className="font-body font-light text-xs uppercase tracking-[0.1em] text-on-surface-variant leading-relaxed">
            Crafting legacies since 1984. Our Jaipur atelier combines ancient stone-cutting techniques with modern elegance.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-on-surface-variant hover:text-primary transition-colors">
              <Share2 size={18} />
            </a>
            <a href="#" className="text-on-surface-variant hover:text-primary transition-colors">
              <Globe size={18} />
            </a>
          </div>
        </div>
        
        <div className="space-y-6">
          <h4 className="font-label text-[10px] uppercase tracking-[0.3em] text-primary">Explore</h4>
          <ul className="space-y-4">
            <li><Link to="/privacy" className="font-body font-light text-xs uppercase tracking-[0.1em] text-on-surface-variant hover:text-primary transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms" className="font-body font-light text-xs uppercase tracking-[0.1em] text-on-surface-variant hover:text-primary transition-colors">Terms of Service</Link></li>
            <li><Link to="/shipping" className="font-body font-light text-xs uppercase tracking-[0.1em] text-on-surface-variant hover:text-primary transition-colors">Shipping Info</Link></li>
            <li><Link to="/appraisal" className="font-body font-light text-xs uppercase tracking-[0.1em] text-on-surface-variant hover:text-primary transition-colors">Appraisal Services</Link></li>
          </ul>
        </div>

        <div className="space-y-6">
          <h4 className="font-label text-[10px] uppercase tracking-[0.3em] text-primary">Jaipur Atelier</h4>
          <div className="space-y-4 text-on-surface-variant font-body font-light text-xs uppercase tracking-[0.1em]">
            <p className="flex items-start gap-2">
              <MapPin size={14} className="mt-0.5 text-primary" />
              <span>122 Johari Bazaar<br />Pink City, Jaipur 302003<br />Rajasthan, India</span>
            </p>
            <p className="flex items-center gap-2">
              <Mail size={14} className="text-primary" />
              <span>atelier@jaseergems.com</span>
            </p>
            <p className="flex items-center gap-2">
              <Phone size={14} className="text-primary" />
              <span>+91 141 2345 678</span>
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <h4 className="font-label text-[10px] uppercase tracking-[0.3em] text-primary">Concierge</h4>
          <p className="font-body font-light text-xs uppercase tracking-[0.1em] text-on-surface-variant">
            Join our inner circle for exclusive previews of rare finds.
          </p>
          <div className="relative mt-4">
            <input 
              type="email" 
              placeholder="Email Address" 
              className="w-full bg-transparent border-b border-outline-variant py-2 text-xs uppercase tracking-widest focus:border-primary transition-colors outline-none text-on-surface"
            />
            <button className="absolute right-0 bottom-2 text-primary">
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
      
      <div className="border-t border-outline-variant/10 py-8 px-12 text-center">
        <p className="font-body font-light text-[9px] uppercase tracking-[0.2em] text-on-surface-variant/60">
          © 2024 JaseerGems Jaipur. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
