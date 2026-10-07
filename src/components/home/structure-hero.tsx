import Link from "next/link";
import { FieldArtwork } from "./field-artwork";

export function StructureHero() {
  return <section className="finished-hero">
    <FieldArtwork />
    <div className="finished-manifesto">
      <p>Blessed are those who create<br /><strong>order from chaos.</strong></p>
      <div>I love technology, biology, and self-improvement.<br />If you like these as well, <Link href="/contact">we&rsquo;ll get along.</Link></div>
    </div>
  </section>;
}
