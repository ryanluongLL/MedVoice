'use client'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'
import { UserButton } from '@clerk/nextjs'
import LanguageSelector from './components/LanguageSelector/LanguageSelector'

export default function Home() {
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [language, setLanguage] = useState('en')
  const router = useRouter()

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped?.type === 'application/pdf') {
      setFile(dropped)
      setError(null)
    } else {
      setError('Please upload a PDF file')
    }
  }, [])

  const handleFileInput = (e) => {
    const selected = e.target.files[0]
    if (selected?.type === 'application/pdf') {
      setFile(selected)
      setError(null)
    } else {
      setError('Please upload a PDF file')
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

      const res = await fetch('http://localhost:8000/analyze-pdf', {
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
      <div className={styles.container}>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>＋</span>
            <span className={styles.logoText}>ClearBill</span>
          </div>
          <UserButton afterSignOutUrl="/sign-in" />
          <p className={styles.tagline}>
            Upload your medical bill. Get a plain-English breakdown — instantly.
          </p>
        </div>

        {/* Upload Card */}
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
              <p className={styles.uploadSub}>or</p>
            </div>
          )}

          <label className={styles.browseBtn}>
            {file ? 'Change File' : 'Browse PDF'}
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileInput}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        {/* Error */}
        {error && <p className={styles.error}>{error}</p>}

        {/* Analyze Button */}
        <LanguageSelector selected={language} onChange={setLanguage} />
        <button
          onClick={handleAnalyze}
          disabled={!file || loading}
          className={`${styles.analyzeBtn} ${!file || loading ? styles.analyzeBtnDisabled : ''}`}
        >
          {loading ? 'Analyzing...' : 'Analyze My Bill'}
        </button>

        {/* Trust note */}
        <p className={styles.trustNote}>
          🔒 Your bill is never stored. Analysis happens in real time.
        </p>

        {/* How it works */}
        <div className={styles.steps}>
          {[
            { icon: '📤', title: 'Upload', desc: 'Drop your PDF bill' },
            { icon: '🤖', title: 'Analyze', desc: 'Claude AI reads every charge' },
            { icon: '✅', title: 'Understand', desc: 'Get plain-English results' },
          ].map((step) => (
            <div key={step.title} className={styles.step}>
              <span className={styles.stepIcon}>{step.icon}</span>
              <p className={styles.stepTitle}>{step.title}</p>
              <p className={styles.stepDesc}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}