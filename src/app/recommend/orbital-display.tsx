import styles from "./recommend.module.css";

/** A vector flight display. The sequence counter records actual launches. */
export function OrbitalDisplay({ sequence, progress = 0 }: { sequence: number; progress?: number }) {
  const entry = String(sequence).padStart(2, "0");
  return <svg className={styles.flightDisplay} viewBox="0 0 800 320" aria-hidden="true">
    <defs>
      <pattern id="flight-grid" width="32" height="32" patternUnits="userSpaceOnUse">
        <path d="M32 0H0V32" fill="none" stroke="#9bb1a5" strokeOpacity=".13"/>
        <circle r="1.2" fill="#a8b6a5" opacity=".45"/>
      </pattern>
      <pattern id="land-hatch" width="3" height="3" patternUnits="userSpaceOnUse">
        <rect width="3" height="3" fill="#cfcaac"/><path d="M0 2.3H3" stroke="#759185" strokeWidth=".65"/>
      </pattern>
      <clipPath id="earth-limb"><circle cx="350" cy="155" r="99"/></clipPath>
      <path id="flight-path" d="M132 221C108 175 245 81 394 52S620 49 602 96 453 231 311 253 146 250 132 221Z"/>
    </defs>
    <rect width="800" height="320" fill="#172522"/>
    <rect width="800" height="320" fill="url(#flight-grid)"/>
    <g fill="none" stroke="#babca3" strokeWidth="1">
      <path d="M22 34v-12h12m732 0h12v12M22 278v12h12m732 0h12v-12"/>
      <path d="M100 155h500M350 21v270" strokeDasharray="3 8" opacity=".45"/>
    </g>
    <circle cx="350" cy="155" r="99" fill="#263c36" stroke="#dedac0" strokeWidth="1.5"/>
    <g clipPath="url(#earth-limb)">
      <g fill="url(#land-hatch)">
        <path d="m243 95 29-28 33-9 26 7-8 9-17 3 8 10-12 4-4 16-14 3-8 17 5 15-9 4-11-14-5-16-14-5Z"/>
        <path d="m288 149 13-5 13 7 9 1 8 11 19 5-3 15-11 13-5 17-9 7-11 22-5-8 3-25-7-16 2-15-11-10Z"/>
        <path d="m320 69 11-18 22-2 8 8-13 14-15 7Z"/>
        <path d="m359 105 9-12 9-2-1-8 15-9 3 13 10-14 29-11 25 6 18 14-1 42-23-2-11 12-12-8-6 10-12-7-7-15-11-3-7 6-11-3-11 5-10-5Z"/>
        <path d="m367 121 14-5 19 5 7 13 14 10-12 19-5 21-10 12-7-9-4-20-10-8-10 1-10-16 5-15Z"/>
      </g>
      <g stroke="#bfc6a9" strokeWidth=".8" fill="none" opacity=".53">
        <ellipse cx="350" cy="155" rx="38" ry="99"/><ellipse cx="350" cy="155" rx="76" ry="99"/>
        <path d="M251 155h198M258 119q92 19 184 0M258 191q92-19 184 0M277 87q73 14 146 0M277 224q73-14 146 0"/>
      </g>
    </g>
    <use href="#flight-path" fill="none" stroke="#f8d9a3" strokeWidth="1.5" strokeDasharray="5 4"/>
    <circle r="5" fill="#ffc883" stroke="#fcf2ce" className={styles.probe} style={{offsetDistance: `${(46 + progress) % 100}%`}}/>
    <g fontFamily="monospace" fontSize="13" fill="#dedac0" letterSpacing="1.4">
      <text x="42" y="47">ORBITAL</text>
      <text x="633" y="234">SEQUENCE</text><text x="633" y="258">{entry}</text>
    </g>
  </svg>;
}
