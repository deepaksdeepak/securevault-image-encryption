import React from 'react';
import {
  ShieldCheck,
  KeyRound,
  Lock,
  Layers,
  Cpu,
  FileCheck2,
  Terminal,
  Hash,
  Sparkles,
  AlertTriangle,
  ArrowDown,
  CheckCircle2,
} from 'lucide-react';

export const SecurityPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-16">
      {/* Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 text-xs font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>FIPS 197 & NIST SP 800-38D Specifications</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Cryptography & Security Architecture
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
          In-depth technical breakdown of the algorithms, key derivation schemes, mathematical
          properties, and container format underpinning SecureVault.
        </p>
      </div>

      {/* Visual Workflow Section */}
      <section className="bg-slate-900/60 backdrop-blur border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-8 shadow-2xl">
        <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          Cryptographic Pipelines & Data Flows
        </h2>

        {/* Diagram 1: Key Derivation Flow */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
            Pipeline A: Password to 256-Bit Key Derivation
          </h3>
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-center font-mono text-xs">
            {/* Step 1 */}
            <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 w-full md:w-44">
              <span className="text-[10px] text-slate-500 block uppercase">Input</span>
              <span className="font-bold text-white text-sm">User Password</span>
              <span className="text-[10px] text-slate-400 block mt-1">UTF-8 Passphrase</span>
            </div>

            <div className="text-cyan-400 hidden md:block">→</div>
            <ArrowDown className="w-4 h-4 text-cyan-400 md:hidden" />

            {/* Step 2 */}
            <div className="p-3.5 bg-cyan-950/60 rounded-xl border border-cyan-800/80 w-full md:w-56 text-cyan-300">
              <span className="text-[10px] text-cyan-400 block uppercase">KDF Function</span>
              <span className="font-bold text-sm block">PBKDF2-HMAC-SHA256</span>
              <span className="text-[10px] text-cyan-400/80 block mt-1">100,000 Rounds + 16B Salt</span>
            </div>

            <div className="text-cyan-400 hidden md:block">→</div>
            <ArrowDown className="w-4 h-4 text-cyan-400 md:hidden" />

            {/* Step 3 */}
            <div className="p-3.5 bg-purple-950/60 rounded-xl border border-purple-800/80 w-full md:w-52 text-purple-300">
              <span className="text-[10px] text-purple-400 block uppercase">Symmetric Key</span>
              <span className="font-bold text-sm block">256-Bit Secret Key</span>
              <span className="text-[10px] text-purple-400/80 block mt-1">32 Raw Pseudorandom Bytes</span>
            </div>

            <div className="text-cyan-400 hidden md:block">→</div>
            <ArrowDown className="w-4 h-4 text-cyan-400 md:hidden" />

            {/* Step 4 */}
            <div className="p-3.5 bg-emerald-950/60 rounded-xl border border-emerald-800/80 w-full md:w-44 text-emerald-300">
              <span className="text-[10px] text-emerald-400 block uppercase">AES Engine</span>
              <span className="font-bold text-sm block">AES-256 Cipher</span>
              <span className="text-[10px] text-emerald-400/80 block mt-1">Injected into AES-GCM</span>
            </div>
          </div>
        </div>

        {/* Diagram 2: Authenticated Encryption Flow */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
            Pipeline B: Authenticated Image Encapsulation Flow
          </h3>
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-center font-mono text-xs">
            {/* Step 1 */}
            <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 w-full md:w-44">
              <span className="text-[10px] text-slate-500 block uppercase">Plaintext</span>
              <span className="font-bold text-white text-sm">Image Payload</span>
              <span className="text-[10px] text-slate-400 block mt-1">PNG, JPG, WEBP, BMP</span>
            </div>

            <div className="text-cyan-400 hidden md:block">→</div>
            <ArrowDown className="w-4 h-4 text-cyan-400 md:hidden" />

            {/* Step 2 */}
            <div className="p-3.5 bg-blue-950/60 rounded-xl border border-blue-800/80 w-full md:w-56 text-blue-300">
              <span className="text-[10px] text-blue-400 block uppercase">AEAD Mode</span>
              <span className="font-bold text-sm block">AES-256-GCM</span>
              <span className="text-[10px] text-blue-400/80 block mt-1">96-bit Nonce + GHASH Poly</span>
            </div>

            <div className="text-cyan-400 hidden md:block">→</div>
            <ArrowDown className="w-4 h-4 text-cyan-400 md:hidden" />

            {/* Step 3 */}
            <div className="p-3.5 bg-amber-950/60 rounded-xl border border-amber-800/80 w-full md:w-52 text-amber-300">
              <span className="text-[10px] text-amber-400 block uppercase">Cipher Outputs</span>
              <span className="font-bold text-sm block">Ciphertext + MAC</span>
              <span className="text-[10px] text-amber-400/80 block mt-1">128-bit Authentication Tag</span>
            </div>

            <div className="text-cyan-400 hidden md:block">→</div>
            <ArrowDown className="w-4 h-4 text-cyan-400 md:hidden" />

            {/* Step 4 */}
            <div className="p-3.5 bg-emerald-950/60 rounded-xl border border-emerald-800/80 w-full md:w-44 text-emerald-300">
              <span className="text-[10px] text-emerald-400 block uppercase">Binary Artifact</span>
              <span className="font-bold text-sm block">.svlt Container</span>
              <span className="text-[10px] text-emerald-400/80 block mt-1">Header + Metadata + Payload</span>
            </div>
          </div>
        </div>
      </section>

      {/* Core Cryptographic Concepts Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Concept 1 */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Cpu className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-white text-base font-mono">What is AES?</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            The <strong>Advanced Encryption Standard (AES)</strong>, originally named Rijndael, is a
            symmetric block cipher established by the US National Institute of Standards and
            Technology (NIST) in 2001 (FIPS PUB 197). It processes 128-bit blocks of data through a
            substitution-permutation network (SPN) consisting of 14 rounds of byte substitution
            (SubBytes), row shifting (ShiftRows), column mixing (MixColumns), and round key addition
            (AddRoundKey).
          </p>
        </div>

        {/* Concept 2 */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/30">
              <KeyRound className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-white text-base font-mono">Why AES-256?</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            AES-256 uses a 256-bit key, establishing a key space of{' '}
            <code className="text-cyan-300 font-mono">2^256 ≈ 1.15 × 10^77</code> combinations.
            Even with exascale supercomputers testing trillions of keys per second, exhaustive brute
            force would require billions of times the current age of the universe. Moreover, Grover's
            quantum search algorithm reduces 256-bit keys to an effective 128 bits of security,
            maintaining quantum resilience.
          </p>
        </div>

        {/* Concept 3 */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-white text-base font-mono">What is AES-GCM?</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            <strong>Galois/Counter Mode (GCM)</strong> is an Authenticated Encryption with
            Associated Data (AEAD) operational mode defined in NIST SP 800-38D. Unlike legacy modes
            such as CBC (which require padding and are vulnerable to padding oracle attacks) or ECB
            (which reveals image outlines like the famous "ECB Penguin"), GCM combines CTR mode
            confidentiality with universal hash function Galois field (GHASH) authentication. It
            produces a 128-bit authentication tag that verifies message integrity in one pass.
          </p>
        </div>

        {/* Concept 4 */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Hash className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-white text-base font-mono">What is PBKDF2?</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Human passwords rarely possess 256 bits of Shannon entropy. <strong>PBKDF2</strong>{' '}
            (Password-Based Key Derivation Function 2, RFC 8018) applies a pseudorandom function
            (HMAC-SHA256) repeatedly across <strong>100,000 iterations</strong> together with a
            random salt. This computational work factor intentionally slows down dictionary and
            brute-force attackers from billions of guesses per second to negligible rates.
          </p>
        </div>

        {/* Concept 5 */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-white text-base font-mono">Why Salt & Nonce are Essential</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            A <strong>Salt</strong> (16 bytes) prevents attackers from using precomputed rainbow tables
            across different files or users. A <strong>Nonce/IV</strong> (12 bytes) ensures that
            encrypting the same image with the same password produces completely distinct
            ciphertext streams every time, eliminating chosen-plaintext and replay attacks.
          </p>
        </div>

        {/* Concept 6 */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-white text-base font-mono">Why Authentication is Critical</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Encryption alone guarantees <em>confidentiality</em>, not <em>integrity</em>. Without
            an authentication tag, an active attacker could flip bits in the ciphertext to alter
            image pixels undetected. In AES-GCM, the authentication tag guarantees that if even a
            single bit of ciphertext is tampered with or the wrong key is supplied, decryption halts
            instantly with an authentication error, protecting against corrupted outputs.
          </p>
        </div>
      </section>

      {/* Binary Container Specification */}
      <section className="bg-slate-900/60 backdrop-blur border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-5 shadow-2xl">
        <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
          <Terminal className="w-5 h-5 text-cyan-400" />
          SecureVault (.svlt) Container Binary Specification
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          The table below documents the byte-level anatomy of the SecureVault container format used
          across both the Node and Python FastAPI engines:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-4">Offset</th>
                <th className="py-2.5 px-4">Length</th>
                <th className="py-2.5 px-4">Field Name</th>
                <th className="py-2.5 px-4">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              <tr>
                <td className="py-2.5 px-4 text-cyan-400 font-bold">0x00..0x03</td>
                <td className="py-2.5 px-4">4 Bytes</td>
                <td className="py-2.5 px-4 font-bold text-white">MAGIC HEADER</td>
                <td className="py-2.5 px-4 text-slate-400">ASCII 'SVLT' (0x53 0x56 0x4C 0x54) identification</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 text-cyan-400 font-bold">0x04</td>
                <td className="py-2.5 px-4">1 Byte</td>
                <td className="py-2.5 px-4 font-bold text-white">VERSION</td>
                <td className="py-2.5 px-4 text-slate-400">Container format version (0x01)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 text-cyan-400 font-bold">0x05..0x14</td>
                <td className="py-2.5 px-4">16 Bytes</td>
                <td className="py-2.5 px-4 font-bold text-white">SALT</td>
                <td className="py-2.5 px-4 text-slate-400">Random 128-bit salt for PBKDF2 key stretching</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 text-cyan-400 font-bold">0x15..0x20</td>
                <td className="py-2.5 px-4">12 Bytes</td>
                <td className="py-2.5 px-4 font-bold text-white">NONCE / IV</td>
                <td className="py-2.5 px-4 text-slate-400">NIST SP 800-38D 96-bit AES-GCM initialization vector</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 text-cyan-400 font-bold">0x21..0x30</td>
                <td className="py-2.5 px-4">16 Bytes</td>
                <td className="py-2.5 px-4 font-bold text-white">AUTH TAG</td>
                <td className="py-2.5 px-4 text-slate-400">128-bit GHASH authentication tag / message authentication code</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 text-cyan-400 font-bold">0x31..0x32</td>
                <td className="py-2.5 px-4">2 Bytes</td>
                <td className="py-2.5 px-4 font-bold text-white">META LEN</td>
                <td className="py-2.5 px-4 text-slate-400">Big-Endian unsigned 16-bit integer (Length of JSON header)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 text-cyan-400 font-bold">0x33..Var</td>
                <td className="py-2.5 px-4">N Bytes</td>
                <td className="py-2.5 px-4 font-bold text-white">METADATA</td>
                <td className="py-2.5 px-4 text-slate-400">UTF-8 JSON containing original filename, MIME type, dimensions</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 text-cyan-400 font-bold">Payload</td>
                <td className="py-2.5 px-4">Remainder</td>
                <td className="py-2.5 px-4 font-bold text-white">CIPHERTEXT</td>
                <td className="py-2.5 px-4 text-slate-400">AES-256-GCM encrypted image bytes</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* College Project Demonstration Guide */}
      <section className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
        <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
          <FileCheck2 className="w-5 h-5 text-emerald-400" />
          Major Project Demonstration Notes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <h4 className="font-bold text-cyan-300 font-mono">1. Defense Against ECB Leakage</h4>
            <p className="text-slate-400 leading-relaxed">
              Show how AES in ECB mode leaks pattern contours (e.g. medical radiographs or identity cards still show outlines). SecureVault uses GCM with a fresh nonce for every image, guaranteeing zero structural leakage.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <h4 className="font-bold text-purple-300 font-mono">2. Wrong Password Resilience</h4>
            <p className="text-slate-400 leading-relaxed">
              Demonstrate entering an incorrect password during decryption. In unauthenticated ciphers, garbage images or crashes occur. In SecureVault, the GCM tag fails before writing output, rejecting the request securely.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <h4 className="font-bold text-emerald-300 font-mono">3. Byte-For-Byte Fidelity</h4>
            <p className="text-slate-400 leading-relaxed">
              Demonstrate SHA-256 hash matching: The SHA-256 hash of the decrypted image exactly matches the hash of the original uploaded image file, proving zero compression degradation or lossy alteration.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <h4 className="font-bold text-amber-300 font-mono">4. Python & Node Interoperability</h4>
            <p className="text-slate-400 leading-relaxed">
              Demonstrate cross-runtime compatibility: A file encrypted in Node.js can be decrypted identically in Python FastAPI with the standard <code className="text-slate-300">cryptography</code> library.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
