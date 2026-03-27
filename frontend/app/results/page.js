"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import styles from "./results.module.css"
import AppealForm from "../components/AppealForm/AppealForm"

export default function Results() {
    const [data, setData] = useState(null)
    const router = useRouter()

    useEffect(() => {
        const stored = localStorage.getItem("billAnalysis")
        if (!stored) {
            router.push('/')
            return
        }
        setData(JSON.parse(stored))
    }, [router])

    if (!data) return null
    
    return (
        <main className={styles.main}>
            <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                    <button onClick={() => router.push('/')} className={styles.backBtn}>
                        ← Analyze another bill
                    </button>
                    <div className={styles.logo}>
                        <span className={styles.logoIcon}>+</span>
                        <span className={styles.logoText}>MedVoice</span>
                    </div>
                </div>

                {/* Summary Card */}
                <div className={styles.summaryCard}>
                    <p className={styles.summaryLabel}>SUMMARY</p>
                    <p className={styles.summaryText}>{data.summary}</p>
                    <div className={styles.totalRow}>
                        <span className={styles.totalLabel}>Total Amount Due</span>
                        <span className={styles.totalAmount}>{data.total_amount}</span>
                    </div>
                </div>
                {/* Red Flags */}
                {data.red_flags?.length > 0 && (
                    <div className={styles.redFlagCard}>
                        <p className={styles.redFlagTitle}>
                            ⚠️ Potential Issues Detected
                        </p>
                        {data.red_flags.map((flag, i) => (
                            <div key={i} className={styles.redFlagItem}>
                                <span className={styles.redFlagDot} />
                                <p className={styles.redFlagText}>{flag}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Charges Breakdown */}
                <div className={styles.section}>
                    <p className={styles.sectionTitle}>CHARGE BREAKDOWN</p>
                    <div className={styles.chargeList}>
                        {data.charges?.map((charge, i) => (
                            <div key={i} className={styles.chargeItem}>
                                <div className={styles.chargeTop}>
                                    <span className={styles.chargeName}>{charge.name}</span>
                                    <span className={styles.chargeAmount}>{charge.amount}</span>
                                </div>
                                <p className={styles.chargeExplanation}>{charge.explanation}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Advice */}
                {data.advice && (
                    <div className={styles.adviceCard}>
                        <p className={styles.adviceLabel}>💡 RECOMMENDED ACTION</p>
                        <p className={styles.adviceText}>{data.advice}</p>
                    </div>
                )}
                {/* Appeal Letter */}
                {data.red_flags?.length > 0 && (
                    <AppealForm analysis={data} />
                )}
            </div>
        </main>
    )
}