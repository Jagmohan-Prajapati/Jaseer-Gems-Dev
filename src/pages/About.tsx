import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Diamond, ArrowRight, ShieldCheck, Gem, Globe } from 'lucide-react';

export default function About() {
  return (
    <main className="pt-32 pb-24 px-6 md:px-12 max-w-6xl mx-auto">
      <section className="text-center max-w-3xl mx-auto mb-20">
        <motion.div
          initial={{ opacity: 0, rotate: -20, scale: 0.9 }}
          animate={{ opacity: 1, rotate: 45, scale: 1 }}
          className="inline-flex justify-center text-primary mb-6"
        >
          <Diamond size={48} />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-label uppercase tracking-[0.3em] text-[10px] text-on-surface-variant mb-4"
        >
          About JaseerGems
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="font-headline italic text-5xl md:text-7xl text-on-surface mb-6"
        >
          A trusted destination for gemstone sourcing
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-on-surface-variant leading-relaxed text-sm md:text-base"
        >
          JaseerGems brings together refined gemstone presentation with deep industry knowledge.
          With 10 years of experience in rough gems manufacturing and trading, we focus on trust, quality, and a smooth customer-first buying experience.
        </motion.p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
        {[
          {
            icon: Gem,
            title: 'Industry Expertise',
            desc: 'Backed by 10 years of practical experience in rough gems manufacturing and trading.',
          },
          {
            icon: ShieldCheck,
            title: 'Trust & Clarity',
            desc: 'Built to give customers a transparent and reliable platform for exploring gemstone products.',
          },
          {
            icon: Globe,
            title: 'Global Reach',
            desc: 'Operating from Bangkok and serving customers across different regions with third-party shipping support.',
          },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-surface-container-low rounded-xl border border-outline-variant/10 p-8">
            <Icon className="text-primary mb-4" size={22} />
            <h2 className="font-headline text-2xl italic text-on-surface mb-3">{title}</h2>
            <p className="text-on-surface-variant text-sm leading-relaxed">{desc}</p>
          </div>
        ))}
      </section>

      <section className="bg-surface-container-high rounded-2xl border border-primary/10 p-10 md:p-14 text-center">
        <h2 className="font-headline italic text-4xl text-on-surface mb-4">Explore the collection</h2>
        <p className="text-on-surface-variant text-sm md:text-base max-w-2xl mx-auto mb-8">
          Browse gemstones by color, type, and carat to discover carefully presented pieces for collecting, gifting, and personal style.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-on-primary rounded-lg font-label text-xs uppercase tracking-[0.2em] font-bold hover:brightness-110 transition-all active:scale-95"
        >
          Browse Collection
          <ArrowRight size={16} />
        </Link>
      </section>
    </main>
  );
}