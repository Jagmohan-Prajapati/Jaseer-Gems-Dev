import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Diamond, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-screen pt-32 pb-24 px-6 flex items-center justify-center">
      <div className="max-w-2xl w-full text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotate: -20 }}
          animate={{ opacity: 1, scale: 1, rotate: 45 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center justify-center mb-8 text-primary"
        >
          <Diamond size={56} />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="font-label uppercase tracking-[0.35em] text-[10px] text-on-surface-variant mb-4"
        >
          Error 404
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-headline italic text-5xl md:text-7xl text-on-surface mb-6"
        >
          This gem could not be found
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-on-surface-variant text-sm md:text-base max-w-xl mx-auto mb-10 leading-relaxed"
        >
          The page you’re looking for may have been moved, renamed, or never existed in the collection.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-on-primary rounded-lg font-label text-xs uppercase tracking-[0.2em] font-bold hover:brightness-110 transition-all active:scale-95 w-full sm:w-auto"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>

          <Link
            to="/shop"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-outline-variant/30 text-on-surface rounded-lg font-label text-xs uppercase tracking-[0.2em] font-bold hover:border-primary/40 hover:text-primary transition-all w-full sm:w-auto"
          >
            <Search size={16} />
            Browse Collection
          </Link>
        </motion.div>
      </div>
    </main>
  );
}