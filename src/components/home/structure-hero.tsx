import Link from "next/link";
import { FieldArtwork } from "./field-artwork";

export function StructureHero() {
  return <section className="finished-hero">
    <div className="finished-hero-intro">
      <div className="finished-hero-label"><span>Monty Singer</span><span>Builder. Writer. Doer.</span></div>
      <h1>Monty Singer.</h1>
      <div className="finished-hero-description"><p>Founder of Prometheus,<br />an applied AI company.</p><a href="#building">Explore my world <span aria-hidden="true">↘</span></a></div>
    </div>
    <FieldArtwork />
    <div className="finished-manifesto">
      <p>Blessed are those who create<br /><strong>order from chaos.</strong></p>
      <div>I love technology, biology, and self-improvement.<br />If you like these as well, <Link href="/contact">we&rsquo;ll get along.</Link></div>
    </div>
  </section>;
}
