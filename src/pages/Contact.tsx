import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

export default function Contact() {
  return (
    <main className="pt-32 pb-24 px-6 md:px-12 max-w-6xl mx-auto">
      <section className="max-w-3xl mb-16">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-label uppercase tracking-[0.3em] text-[10px] text-on-surface-variant mb-4"
        >
          Contact
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="font-headline italic text-5xl md:text-7xl text-on-surface mb-6"
        >
          Get in touch with JaseerGems
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-on-surface-variant text-sm md:text-base leading-relaxed"
        >
          Reach out for product inquiries, order assistance, or support. We are happy to help with questions related to gemstones, shipping, and policies.
        </motion.p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-surface-container-low rounded-xl border border-outline-variant/10 p-8">
          <Mail className="text-primary mb-4" size={22} />
          <h2 className="font-headline italic text-2xl text-on-surface mb-2">Email</h2>
          <a href="mailto:jaseergems@gmail.com" className="text-primary text-sm hover:underline break-all">
            jaseergems@gmail.com
          </a>
        </div>

        <div className="bg-surface-container-low rounded-xl border border-outline-variant/10 p-8">
          <Phone className="text-primary mb-4" size={22} />
          <h2 className="font-headline italic text-2xl text-on-surface mb-2">Phone</h2>
          <a href="tel:+66959856297" className="text-primary text-sm hover:underline">
            +66 959856297
          </a>
        </div>

        <div className="bg-surface-container-low rounded-xl border border-outline-variant/10 p-8 md:col-span-2">
          <MapPin className="text-primary mb-4" size={22} />
          <h2 className="font-headline italic text-2xl text-on-surface mb-2">Office Address</h2>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            No. 3/2, TRD Building, Room 201, 2nd Floor, Soi Pramote 3, Mahesak Road,
            Suriyawong Subdistrict, Bang Rak District, Bangkok 10500.
          </p>
        </div>

        <div className="bg-surface-container-low rounded-xl border border-outline-variant/10 p-8">
          <Clock className="text-primary mb-4" size={22} />
          <h2 className="font-headline italic text-2xl text-on-surface mb-2">Shipping Note</h2>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            Orders are shipped within 5 working days after confirmation. Transit time depends on destination and courier service.
          </p>
        </div>
      </section>
    </main>
  );
}