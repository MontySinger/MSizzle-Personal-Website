import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import styles from "./not-found.module.css";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <section className={styles.room}>
      <div className={styles.shelf}>
        <span aria-hidden="true">4</span>
        <Link href="/#current-carry" className={styles.sock} aria-label="Return the socks to Monty’s shelf">
          <Image src="/current-carry/darn-tough-mark.webp" width={96} height={100} alt="" />
        </Link>
        <span aria-hidden="true">4</span>
      </div>
      <h1><span className="sr-only">404. </span>This page wandered off.</h1>
      <p>At least you found the socks.</p>
      <nav aria-label="Find your way back">
        <Link href="/">Back home <span aria-hidden="true">↗</span></Link>
        <Link href="/writing">Browse essays</Link>
      </nav>
    </section>
  );
}
