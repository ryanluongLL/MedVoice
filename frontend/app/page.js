'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import styles from './page.module.css'

export default function Home() {
  const [inputMode, setInputMode] = useState('code') // 'code' | 'describe'
  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [billedAmount, setBilledAmount] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [matchResult, setMatchResult] = useState(null)
  const [matchLoading, setMatchLoading] = useState(false)
  const [matchedFrom, setMatchedFrom] = useState('')

  const switchToDescribe = () => {
    setInputMode('describe')
    setMatchResult(null)
    setResult(null)
  }

  const switchToCode = () => {
    setInputMode('code')
    setMatchResult(null)
  }

  const handleFindCode = async (e) => {
    e.preventDefault()
    if (!description.trim()) return

    setMatchLoading(true)
    setMatchResult(null)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/match-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: description.trim() }),
      })

      if (!res.ok) {
        toast.error('Something went wrong. Please try again.')
        return
      }

      const data = await res.json()
      setMatchResult(data)
    } catch (err) {
      toast.error('Could not reach the server. Is it running?')
    } finally {
      setMatchLoading(false)
    }
  }

  const confirmCode = (selectedCode) => {
    setCode(selectedCode)
    setMatchedFrom(description)
    setInputMode('code')
    setMatchResult(null)
    setDescription('')
  }

  const handleCheck = async (e) => {
    e.preventDefault()
    if (!code.trim() || !billedAmount) return

    setLoading(true)
    setResult(null)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/check-charge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        toast.error('Something went wrong. Please try again.')
        return
      }

      const data = await res.json()
      setResult(data)
    } catch (err) {
      toast.error('Could not reach the server. Is it running?')
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
            {inputMode === 'code' && (
              <>
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
                      placeholder="$400"
                      value={billedAmount}
                      onChange={(e) => setBilledAmount(e.target.value)}
                      autoComplete="off"
                    />
                  </div>
                  <button type="submit" className={styles.ledgerBtn} disabled={loading}>
                    {loading ? 'Checking' : 'Check against benchmark'}
                  </button>
                </form>

                {matchedFrom && code && (
                  <p className={styles.matchedNote}>
                    Matched from &ldquo;{matchedFrom}&rdquo;. Not the right code?{' '}
                    <button type="button" className={styles.inlineLink} onClick={switchToDescribe}>
                      Describe it again
                    </button>
                  </p>
                )}

                {!matchedFrom && (
                  <p className={styles.toggleRow}>
                    <button type="button" className={styles.inlineLink} onClick={switchToDescribe}>
                      Don&apos;t know your code? Describe it instead
                    </button>
                  </p>
                )}
              </>
            )}

            {inputMode === 'describe' && (
              <>
                <form className={styles.ledger} onSubmit={handleFindCode}>
                  <div className={styles.ledgerRow}>
                    <label className={styles.ledgerLabel} htmlFor="description">What was it?</label>
                    <input
                      id="description"
                      className={styles.ledgerInput}
                      placeholder="office visit, chest xray, flu shot..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      autoComplete="off"
                    />
                  </div>
                  <button type="submit" className={styles.ledgerBtn} disabled={matchLoading}>
                    {matchLoading ? 'Searching' : 'Find code'}
                  </button>
                </form>

                <p className={styles.toggleRow}>
                  <button type="button" className={styles.inlineLink} onClick={switchToCode}>
                    Know your CPT code? Enter it directly
                  </button>
                </p>

                {matchResult && matchResult.status === 'confident' && (
                  <div className={styles.matchBox}>
                    <p className={styles.matchBoxTitle}>Best match</p>
                    <p className={styles.matchBoxDesc}>
                      <strong>{matchResult.code}</strong> {matchResult.description}
                    </p>
                    <button
                      type="button"
                      className={styles.ledgerBtn}
                      onClick={() => confirmCode(matchResult.code)}
                    >
                      Use this code
                    </button>
                  </div>
                )}

                {matchResult && matchResult.status === 'needs_selection' && (
                  <div className={styles.matchBox}>
                    <p className={styles.matchBoxTitle}>Which one fits?</p>
                    <p className={styles.matchBoxSub}>
                      A description alone can&apos;t tell us the exact billing level.
                      Pick the one that matches your visit.
                    </p>
                    {matchResult.candidates.map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        className={styles.candidateBtn}
                        onClick={() => confirmCode(c.code)}
                      >
                        <span className={styles.candidateCode}>{c.code}</span>
                        <span className={styles.candidateDesc}>{c.description}</span>
                      </button>
                    ))}
                  </div>
                )}

                {matchResult && matchResult.status === 'unsupported' && (
                  <div className={styles.resultNeutral}>
                    <strong>Not priced under this dataset</strong>
                    {matchResult.reason}
                  </div>
                )}

                {matchResult && matchResult.status === 'low_confidence' && (
                  <div className={styles.resultNeutral}>
                    <strong>Couldn&apos;t confidently match that</strong>
                    Try describing it differently, or enter your CPT code directly if you know it.
                  </div>
                )}
              </>
            )}

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
          dispute or legal determination.{' '}
          <a href="/privacy" className={styles.footerLink}>Privacy</a>
        </footer>

      </div>
    </main>
  )
}