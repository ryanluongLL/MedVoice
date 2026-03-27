'use client'
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import styles from './appeal.module.css'
import jsPDF from "jspdf"

export default function Appeal() {
    const [letter, setLetter] = useState('')
    const router = useRouter()

    //check if appeal letter exist in localStorage
    useEffect(() => {
        const stored = localStorage.getItem('appealLetter')
        if (!stored) {
            router.push('/')
            return
        }
        setLetter(stored)
    }, [router])

    const handleCopy = () => {
        //read from and write to the user's clipboard and let them paste it anywhere
        navigator.clipboard.writeText(letter)
        alert('Letter copied to clipboard!')
    }

    const handleDownloadTxt = () => {
        const blob = new Blob([letter], { type: 'text/plain' })
        const url = URL.createObjectURL(blob) ///temporary url
        const a = document.createElement('a')
        a.href = url
        a.download = 'appeal_letter.txt'
        a.click()
        URL.revokeObjectURL(url)
    }

    const handleDownloadPdf = () => {
        const doc = new jsPDF()
        const margin = 25
        const pageWidth = doc.internal.pageSize.getWidth()
        const maxWidth = pageWidth - margin * 2
        const lineHeight = 7
        let y = margin

        const lines = doc.splitTextToSize(letter, maxWidth)
        
        lines.forEach((line) => {
            if (y + lineHeight > doc.internal.pageSize.getHeight() - margin) {
                doc.addPage()
                y = margin
            }
            doc.text(line, margin, y)
            y += lineHeight
        })
        doc.save('appeal_letter.pdf')
    }

    if (!letter) return null
    
    return (
        <main className={styles.main}>
            <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                    <button onClick={() => router.back()} className={styles.backBtn}>
                        ← Back to results
                    </button>
                    <div className={styles.logo}>
                        <span className={styles.logoIcon}>+</span>
                        <span className={styles.logoText}>MedVoice</span>
                    </div>
                </div>

                <p className={styles.title}>Your Appeal Letter</p>
                <p className={styles.subTitle}>
                    Review your letter below, then copy or download it to send to your insurance company
                </p>

                {/* Action Buttons */}
                <div className={styles.action}>
                    <button onClick={handleCopy} className={styles.copyBtn}>
                        📋 Copy to Clipboard
                    </button>
                    <button onClick={handleDownloadTxt} className={styles.downloadBtn}>
                        ⬇ Download as TXT 
                    </button>
                    <button onClick={handleDownloadPdf} className={styles.downloadBtn}>
                        📋 Download as PDF
                    </button>
                </div>

                {/* Letter */}
                <div className={styles.letterCard}>
                    <pre className={styles.letterText}>{letter}</pre>
                </div>

                {/* Bottom actions */}
                <div className={styles.action}>
                    <button onClick={handleCopy} className={styles.copyBtn}>
                        📋 Copy to Clipboard
                    </button>

                    <button onClick={handleDownloadTxt} className={styles.downloadBtn}>
                        ⬇ Download as TXT 
                    </button>

                     <button onClick={handleDownloadPdf} className={styles.downloadBtn}>
                        📋 Download as PDF
                    </button>
                </div>
            </div>
        </main>
    )
}