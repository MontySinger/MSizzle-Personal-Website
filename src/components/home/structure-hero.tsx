import Link from "next/link";
import { PortraitStory } from "./portrait-story";

export function StructureHero() {
  return <section className="structure-hero">
    <PortraitStory field>
      <div className="structure-intro">
        <span className="structure-eyebrow">Builder. Writer. Doer.</span>
        <h1>Monty<br />Singer.</h1>
        <p>Founder of Prometheus, an applied AI company.</p>
        <a href="#building">Into the field <span aria-hidden="true">↓</span></a>
      </div>
    </PortraitStory>
    <div className="structure-manifesto wrap">
      <p>Blessed are those who create<br /><strong>order from chaos.</strong></p>
      <div>I love technology, biology, and self-improvement.<br />If you like these as well, <Link href="/contact">we&rsquo;ll get along.</Link></div>
    </div>
  </section>;
}
