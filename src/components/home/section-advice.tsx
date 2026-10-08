import Link from "next/link";
import { accentStyle } from "@/lib/accent-rotation";

export function SectionAdvice({ accentIndex }: { accentIndex: number }) {
  return (
    <section className="finished-advice" id="advice" aria-labelledby="advice-title">
      <div className="finished-advice-label">04 · A note for me</div>
      <div className="finished-advice-body">
        <div>
          <h2 id="advice-title">Unsolicited advice.</h2>
          <p>Anonymous. No login.</p>
        </div>
        <Link className="finished-advice-link" href="/advice" style={accentStyle(accentIndex)}>
          Say it <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </section>
  );
}
