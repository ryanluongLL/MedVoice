"use client"
import { useState } from "react"
import toast from "react-hot-toast"
import styles from "./page.module.css"

export default function Home() {
  const [code, setCode] = useState('')
  const [billedAmount, setBilledAmount] = useState("")
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleCheck = async (e) => {
    e.preventDefault()
    if (!code.trim() || !billedAmount) return

    setLoading(true)
    setResult(null)

    try {
      const res = await fetch("http://localhost:8000/check-charge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim(),
          billed_amount: parseFloat(billedAmount),
        }),
      })

      if (res.status === 404) {
        const data = await res.json()
        toast.error(data.detail)
        return
      }

      if (!res.ok) {
        toast.error("Something went wrong. Please try again.")
        return
      }

      const data = await res.json()
      setResult(data)
    }
    catch (err) {
      toast.error("Could not reach the server. It is running?")
    } finally {
      setLoading(false)
    }
  }

  const ratio = Number(result?.ratio_vs_benchmark)
  const isAbove = Boolean(result?.benchmark_available) && Number.isFinite(ratio) && ratio > 1
  return (
    <main className={styles.main}>
      <div className={styles.wrap}>

        <nav className={styles.nav}>
          <div className={styles.wordmark}>Med<span>Ledger</span></div>
          <div className={styles.navlinks}>
            <a className={styles.navlink} href="/how-it-works">How it works</a>
            <a className={styles.navlink} href="https://github.com/ryanluongLL/MedVoice" target="_blank" rel="noopener noreferrer">GitHub</a>
          </div>
        </nav>

        <div className={styles.hero}>
          <div>
            <div className={styles.eyebrow}>Cross-referenced with CMS fee schedule data</div>
            <h1 className={styles.h1}>
              See what Medicare<br />
              actually pays for<br />
              <em>your procedure code.</em>
            </h1>
            <p className={styles.sub}>
              Enter the CPT code and amount from your bill. We compare it against
              the public, government-published benchmark rate. No upload, no
              document, no account.
            </p>
            <div className={styles.sourceLine}>
              SOURCE: CMS PHYSICIAN FEE SCHEDULE, RVU26B, APR 2026 RELEASE
            </div>
          </div>

          <div>
            <form className={styles.ledger} onSubmit={handleCheck}>
              <div className={styles.ledgerRow}>
                <label className={styles.ledgerLabel} htmlFor="code">CPT Code</label>
                <input
                  id="code"
                  className={styles.ledgerInput}
                  placeholder="99213"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  maxLength={5}
                  autoComplete="off"
                />
              </div>
              <div className={styles.ledgerRow}>
                <label className={styles.ledgerLabel} htmlFor="amount">You were billed</label>
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  className={styles.ledgerInput}
                  placeholder="400.00"
                  value={billedAmount}
                  onChange={(e) => setBilledAmount(e.target.value)}
                  autoComplete="off"
                />
              </div>
              <button type="submit" className={styles.ledgerBtn} disabled={loading}>
                {loading ? 'Checking' : 'Check against benchmark'}
              </button>
            </form>

            <div aria-live="polite">
              {result && result.benchmark_available && (
                <div className={`${styles.result} ${isAbove ? styles.resultFlag : ''}`}>
                  <div className={styles.resultDesc}>
                    <strong>{result.description}</strong>
                    Medicare non-facility benchmark: ${result.benchmark_nonfacility.toFixed(2)}
                  </div>
                  <div className={styles.resultRatio}>
                    {ratio}&times;
                    <span>vs. benchmark</span>
                  </div>
                </div>
              )}

              {result && !result.benchmark_available && (
                <div className={styles.resultNeutral}>
                  <strong>{result.description}</strong>
                  {result.reason}
                </div>
              )}
            </div>
          </div>
        </div>

        <footer className={styles.footer}>
          Benchmark figures reflect Medicare&apos;s national non-facility rate and are a
          public reference point, not a legal maximum. Private insurance and cash-pay
          pricing commonly differ. This tool provides comparison context, not a billing
          dispute or legal determination.
          {' '}<a href="/privacy" className={styles.footerLink}>Privacy</a>
        </footer>

      </div>
    </main>
  )
}