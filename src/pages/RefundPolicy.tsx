export default function RefundPolicy() {
  return (
    <main className="pt-32 pb-24 px-6 md:px-12 max-w-4xl mx-auto">
      <div className="mb-12">
        <p className="font-label uppercase tracking-[0.3em] text-[10px] text-on-surface-variant mb-4">
          Legal
        </p>
        <h1 className="font-headline italic text-5xl md:text-6xl text-on-surface mb-6">
          Refund & Cancellation Policy
        </h1>
      </div>

      <div className="space-y-8 text-sm leading-relaxed text-on-surface-variant">
        <section>
          <h2 className="font-headline italic text-2xl text-on-surface mb-3">Refundable Packages</h2>
          <p>Eligible orders may be refunded with a 3.75% deduction from the total bill to cover administrative and transaction costs.</p>
        </section>

        <section>
          <h2 className="font-headline italic text-2xl text-on-surface mb-3">Refund Request Process</h2>
          <p>Refund requests must be submitted in writing by email to jaseergems@gmail.com.</p>
          <p>Refund processing may take 7–14 working days after confirmation.</p>
        </section>

        <section>
          <h2 className="font-headline italic text-2xl text-on-surface mb-3">Non-Refundable Items</h2>
          <p>Custom made articles and products are non-refundable.</p>
        </section>
      </div>
    </main>
  );
}