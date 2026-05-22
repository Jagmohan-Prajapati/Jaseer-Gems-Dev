export default function ShippingPolicy() {
  return (
    <main className="pt-32 pb-24 px-6 md:px-12 max-w-4xl mx-auto">
      <div className="mb-12">
        <p className="font-label uppercase tracking-[0.3em] text-[10px] text-on-surface-variant mb-4">
          Legal
        </p>
        <h1 className="font-headline italic text-5xl md:text-6xl text-on-surface mb-6">
          Shipping Policy
        </h1>
      </div>

      <div className="space-y-8 text-sm leading-relaxed text-on-surface-variant">
        <section>
          <h2 className="font-headline italic text-2xl text-on-surface mb-3">Order Processing</h2>
          <p>Once an order is confirmed, it takes 5 working days to ship the product from our company.</p>
        </section>

        <section>
          <h2 className="font-headline italic text-2xl text-on-surface mb-3">Transit Time</h2>
          <p>Shipping transit time depends on the destination state or country and on the courier company handling the shipment.</p>
        </section>

        <section>
          <h2 className="font-headline italic text-2xl text-on-surface mb-3">Third-Party Couriers</h2>
          <p>Delivery is handled through third-party courier partners, so timing may vary depending on logistics and regional availability.</p>
        </section>
      </div>
    </main>
  );
}