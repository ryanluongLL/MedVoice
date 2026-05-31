'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styles from './ConsentModal.module.css'

export default function ConsentModal() {
    const [show, setShow] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const consent = localStorage.getItem('medvoice_consent')
        if (!consent) setShow(true)
    }, [])

    const handleAgree = () => {
        localStorage.setItem('medvoice_consent', 'true')
        setShow(false)
    }

    const handleDecline = () => {
        router.push('/privacy')
    }

    if (!show) return null

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.logoRow}>
                    <span className={styles.logoIcon}>＋</span>
                    <span className={styles.logoText}>MedVoice</span>
                </div>

                <h2 className={styles.title}>Before you continue</h2>

                <p className={styles.body}>
                    To analyze your bill, MedVoice uses AI to process the text content.
                    Here is what you should know:
                </p>

                <ul className={styles.list}>
                    <li>Your original bill file is <strong>never stored</strong> — it is analyzed in memory and discarded immediately</li>
                    <li>Only the AI-generated analysis results are saved to your account</li>
                    <li>Your data is never sold or shared with third parties</li>
                    <li>You can request deletion of your data at any time</li>
                </ul>

                <p className={styles.link}>
                    Read our full{' '}
                    <a href="/privacy" target="_blank" className={styles.privacyLink}>
                        Privacy Policy
                    </a>
                </p>

                <div className={styles.actions}>
                    <button onClick={handleDecline} className={styles.declineBtn}>
                        Read Policy First
                    </button>
                    <button onClick={handleAgree} className={styles.agreeBtn}>
                        I Agree — Continue
                    </button>
                </div>
            </div>
        </div>
    )
}