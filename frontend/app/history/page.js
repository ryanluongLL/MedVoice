'use client'
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import styles from './history.module.css'

export default function History() {
    const [records, setRecords] = useState([])
    const [loading, setLoading] = useState(true)
    const { user } = useUser()
    const router = useRouter()

    useEffect(() => {
        if (!user) return
        
        const fetchHistory = async () => {
            try {
                const res = await fetch(`http://localhost:8000/history/${user.id}`)
                const data = await res.json()
                setRecords(data)
            }
            catch (err) {
                console.error('Failed to fetch history', err)
            }
            finally {
                setLoading(false)
            }
        }
        fetchHistory()
    }, [user])

    const formatDate = (isoString) => {
        return new Date(isoString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    return (
        <main className={styles.main}>
            <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                    <button onClick={() => router.push('/')} className={styles.backBtn}>
                        ← Back to upload
                    </button>
                    <div className={styles.logo}>
                        <span className={styles.logoIcon}>+</span>
                        <span className={styles.logoText}>MedVoice</span>
                    </div>
                </div>
                <p className={styles.title}>Your Bill History</p>
                <p className={styles.subtitle}>All your past analyses in one place</p>

                {/* Loading */}
                {loading && (
                    <p className={styles.loading}>Loading your history...</p>
                )}

                {/* Empty State */}
                {!loading && records.length === 0 && (
                    <div className={styles.emptyState}>
                        <p className={styles.emptyIcon}></p>
                        <p className={styles.emptyTitle}>No analyses yet</p>
                        <p className={styles.emptyDesc}>Upload your first bill to get started</p>
                        <button onClick={() => router.push('/')} className={styles.uploadBtn}>Upload a Bill</button>
                    </div>
                )}

                {/* Records */}
                <div className={styles.list}>
                    {records.map((record) => (
                        <div key={record.id} className={styles.card} onClick={() => {
                            localStorage.setItem('billAnalysis', JSON.stringify({
                                summary: record.summary,
                                total_amount: record.total_amount,
                                charges: record.charges,
                                red_flags: record.red_flags,
                                advice: record.advice,
                            }))
                            console.log('charges:', record.charges)
                            router.push('/results')
                        }}>
                            <div className={styles.cardTop}>
                                <div>
                                    <p className={styles.filename}>{record.filename}</p>
                                    <p className={styles.date}>{formatDate(record.created_at)}</p>
                                </div>
                                <span className={styles.amount}>{record.total_amount}</span>
                                <p className={styles.clickHint}>View full analysis</p>
                            </div>
                            <p className={styles.summary}>{record.summary}</p>
                            <div className={styles.cardBottom}>
                                {record.red_flags?.length > 0 && (
                                    <span className={styles.flagBadge}>
                                        ⚠️ {record.red_flags.length} flag{record.red_flags.length > 1 ? 's' : ''}
                                    </span>
                                )}
                                <span className={styles.langBadge}>
                                    {(record.language || 'en').toUpperCase()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    )
}