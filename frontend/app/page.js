'use client'
import { useState, useCallback, useRef} from 'react'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'
import { SignInButton, UserButton } from '@clerk/nextjs'
import LanguageSelector from './components/LanguageSelector/LanguageSelector'
import { useUser } from '@clerk/nextjs'

const STATS = [
  { value: '51%', label: 'of insured adults struggle to understand at least one asepect of their health insurance' },
  { value: '$300B', label: 'lost annually in the US due to the medical billing errors' },
  { value: '8 int 10', label: 'medical bills contain at least one error according to billing experts'}
]

export default function Home() {
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [language, setLanguage] = useState('en')
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const appRef = useRef(null)

  const scrollToApp = () => {
    appRef.current?.scrollIntoView({behavior: 'smooth'})
  }
  
  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
    if (allowed.includes(dropped?.type)) {
      setFile(dropped)
      setError(null)
    } else {
      setError("Please uoload a PDF or image file (JPG, PNG, WEBP")
    }
  }, [])

  const handleFileInput = (e) => {
    const selected = e.target.files[0]
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/web']
    if (allowed.includes(selected?.type)) {
      setFile(selected)
      setError(null)
    } else {
      setError("Please upload a PDF or image file (JPG, PNG, WEBP)")
    }
  }

  const handleAnalyze = async () => {
    if (!file) return
    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('language', language)
      formData.append('user_id', user?.id || 'anoymous') 

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analyze-pdf`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Analysis failed')

      const data = await res.json()
      localStorage.setItem('billAnalysis', JSON.stringify(data))
      router.push('/results')
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className={styles.main}>
      {/* hero section */}
      <section className={styles.hero}>
        <nav className={styles.nav}>
          <div className={styles.navLogo}>
            <span className={styles.navLogoIcon}>+</span>
            <span className={styles.navLogoText}>MedVoice</span>
          </div>
          <div className={styles.navActions}>
            {isLoaded && user ? (
              <>
                <button onClick={() => router.push('/history')} className={styles.navHistoryBtn}>
                  My history
                </button>
                  <UserButton afterSignOutUrl="/sign-in" />
              </>
            ) : (
                <SignInButton mode="redirect">
                  <button className={styles.navSignInBtn}>Sign In</button>
                </SignInButton>
            )}
          </div>
        </nav>

        {/* hero content */}
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>AI-Powered Healthcare Billing</span>
          <h1 className={styles.heroTitle}>
            Your medical bill  <br />
            <span className={styles.heroTitleAccent}>finally explained</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Upload any medical bill and get a complete breakdown of every charge, potential errors flagged, and a professional appeal letter - in seconds.
          </p>
          <button onClick={scrollToApp} className={styles.heroBtn}>
            Analyze My Bill →
          </button>
        </div>

        {/* Stats */}
        <div className={styles.stats}>
          {STATS.map((stat) => {
            <div key={stat.value} className={styles.statCard}>
              <p className={styles.statValue}>{stat.value}</p>
              <p className={styles.statLabel}>{stat.label}</p>
            </div>
            })}
        </div>
      </section>

      {/* app section */}
      <section ref={ appRef} className={styles.appSection}>
        <div className={styles.appContainer}>
          <div className={styles.appHeader}>
            <h2 className={styles.appTitle}>Analyze your bill</h2>
            <p className={styles.appSubtitle}>
              Upload a PDF of your medical bill and select your preferred language
            </p>
          </div>

          {!isLoaded ? null : !user ? (
            <div className={styles.signInPrompt}>
              <p className={styles.signInIcon}></p>
              <p className={styles.signInTitle}>Sign in to get started</p>
              <p className={styles.signInDesc}>
                Create a free account to analyze your bill and save your history
              </p>
              <SignInButton mode="redirect">
                  <button className={styles.signInBtn}>Sign In / Sign Up</button>
              </SignInButton>
            </div>
          ) : (
            <>
                <div
                  className={`${styles.uploadCard} ${dragging ? styles.uploadCardDragging : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                >
                  <div className={styles.uploadIcon}>📄</div>
                  {file ? (
                    <div>
                      <p className={styles.fileName}>{file.name}</p>
                      <p className={styles.fileReady}>Ready to analyze</p>
                    </div>
                  ) : (
                      <div>
                        <p className={styles.uploadTitle}>Drag & drop your bill here</p>
                        <p className={styles.uploadSub}>PDF, JPG, PNG or WEBP</p>
                      </div>
                  )}
                  <label className={styles.browseBtn}>
                    {file ? 'Change File' : 'Browse File'}
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      onChange={handleFileInput}
                      style={{display: 'none'}}
                    />
                  </label>
                </div>

                {error && <p className={styles.error}>{error}</p>}
                
                <LanguageSelector selected={language} onChange={setLanguage} />

                <button
                  onClick={handleAnalyze}
                  disabled={!file || loading}
                  className={`${styles.analyzeBtn} ${!file || loading ? styles.analyzeBtnDisabled : ''}`}
                >
                  {loading ? (
                    <span className={styles.loadingRow}>
                      <span className={styles.spinner} />
                        Analyzing your bill...
                    </span>
                  ) : 'Analyze My Bill'}
                </button>

                <p className={styles.trustNote}>
                  🔒 Your bill is never stored. Analysis happens in real time.
                </p>
            </>
          )}
        </div>
      </section>
    </main>
  )
}