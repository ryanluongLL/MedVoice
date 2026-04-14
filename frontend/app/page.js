'use client'
import { useState, useCallback, useRef} from 'react'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'
import { SignInButton, UserButton } from '@clerk/nextjs'
import LanguageSelector from './components/LanguageSelector/LanguageSelector'
import { useUser } from '@clerk/nextjs'
import { motion } from 'motion/react'

const STATS = [
  { value: '51%', label: 'of insured adults struggle to understand at least one asepect of their health insurance' },
  { value: '$300B', label: 'lost annually in the US due to the medical billing errors' },
  { value: '8 in 10', label: 'medical bills contain at least one error according to billing experts'}
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
      setError("Please upload a PDF or image file (JPG, PNG, WEBP")
    }
  }, [])

  const handleFileInput = (e) => {
    const selected = e.target.files[0]
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
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
      formData.append('user_id', user?.id || 'anonymous') 

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
                <button onClick={() => router.push('/dashboard')} className={styles.navHistoryBtn}>
                  Dashboard
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
          <motion.span
            className={styles.heroBadge}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{duration: 0.5, ease: 'easeOut'}}
          >
              AI-Powered Healthcare Billing
          </motion.span>
          
          <motion.h1
            className={styles.heroTitle}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
        >
            Your medical bill <br />
            <span className={styles.heroTitleAccent}>finally explained</span>
          </motion.h1>
          
          <motion.p
              className={styles.heroSubtitle}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
          >
              Upload any medical bill and get a complete breakdown of every charge,
              potential errors flagged, and a professional appeal letter - in seconds.
          </motion.p>

          <motion.button
              onClick={scrollToApp}
              className={styles.heroBtn}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.45, ease: 'easeOut' }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
          >
              Analyze My Bill →
          </motion.button>
        </div>

        {/* Stats */}
        <div className={styles.stats}>
          {STATS.map((stat, index) => (
            <motion.div
                key={stat.value}
                className={styles.statCard}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
            >
                <p className={styles.statValue}>{stat.value}</p>
                <p className={styles.statLabel}>{stat.label}</p>
            </motion.div>
        ))}
        </div>
      </section>

      {/* app section */}
      <section ref={ appRef} className={styles.appSection}>
        <div className={styles.appContainer}>
          <div className={styles.appHeader}>
            <motion.h2
                className={styles.appTitle}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
            >
                Analyze your bill
            </motion.h2>
            <motion.p
                className={styles.appSubtitle}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
            >
                Upload a PDF of your medical bill and select your preferred language
            </motion.p>
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
                <motion.div
                  className={`${styles.uploadCard} ${dragging ? styles.uploadCardDragging : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  whileHover={{ scale: 1.01, boxShadow: '0 8px 24px rgba(2, 195, 154, 0.12)' }}
                  transition={{ duration: 0.2 }}
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
                </motion.div>

                {error && <p className={styles.error}>{error}</p>}
                
                <LanguageSelector selected={language} onChange={setLanguage} />

                <motion.button
                  onClick={handleAnalyze}
                  disabled={!file || loading}
                  className={`${styles.analyzeBtn} ${!file || loading ? styles.analyzeBtnDisabled : ''}`}
                  animate={file && !loading ? { scale: [1, 1.02, 1] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  whileHover={file && !loading ? { scale: 1.02 } : {}}
                  whileTap={file && !loading ? { scale: 0.98 } : {}}
              >
                  {loading ? (
                      <span className={styles.loadingRow}>
                          <span className={styles.spinner} />
                          Analyzing your bill...
                      </span>
                  ) : 'Analyze My Bill'}
              </motion.button>

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