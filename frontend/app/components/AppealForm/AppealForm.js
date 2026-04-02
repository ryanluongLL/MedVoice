'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import styles from './AppealForm.module.css'

export default function AppealForm({ analysis }) {
    const [formData, setFormData] = useState({
        patient_name: '',
        date_of_birth: '',
        insurance_id: '',
        insurance_company: '',
        hospital_name: '',
        hospital_address: '',
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const router = useRouter()

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value})
    }

    const handleSubmit = async () => {
        const required = Object.values(formData).every(v => v.trim() !== '')
        if (!required) {
            setError('Please fill in all fields')
            return
        }

        setLoading(true)
        setError(null)

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/generate-appeal`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    summary: analysis.summary,
                    total_amount: analysis.total_amount,
                    charges: analysis.charges || [],
                    red_flags: analysis.red_flags || [],
                }),
            })

            if (!res.ok) throw new Error('Failed to generate letter')
            
            const data = await res.json()
            localStorage.setItem('appealLetter', data.letter)
            router.push('/appeal')
        } catch (err) {
            setError('Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }
    return (
        <div className={styles.wrapper}>
            <p className={styles.title}>✉️ Generate Appeal Letter</p>
            <p className={styles.subtitle}>
                Fill in your details and we'll generate a professional insurance appeal letter based on your bill analysis
            </p>
            <div className={styles.section}>
                <p className={styles.sectionLabel}>Your Information</p>
                <div className={styles.grid}>
                    <div className={styles.field}>
                        <label className={styles.label}>Full Name</label>
                        <input
                            className={styles.input}
                            name="patient_name"
                            placeholder="John Doe"
                            value={formData.patient_name}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>Date of Birth</label>
                        <input
                            className={styles.input}
                            name="date_of_birth"
                            placeholder="MM/DD/YYYY"
                            value={formData.date_of_birth}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>Insurance ID</label>
                        <input
                            className={styles.input}
                            name="insurance_id"
                            placeholder="ABC123456789"
                            value={formData.insurance_id}
                            onChange={handleChange}
                        />
                    </div>
                    <div className={styles.field}>
                        <label className={styles.label}>Insurance Company</label>
                        <input
                            className={styles.input}
                            name="insurance_company"
                            placeholder="Blue Cross Blue Shield"
                            value={formData.insurance_company}
                            onChange={handleChange}
                        />
                    </div>
                </div>
            </div>
            <div className={styles.section}>
                <p className={styles.sectionLabel}>Hospital / Provider</p>
                <div className={styles.grid}>
                    <div className={styles.field}>
                        <label className={styles.label}>Hospital Name</label>
                        <input
                            className={styles.input}
                            name="hospital_name"
                            placeholder="Sunrise Valley Medical Center"
                            value={formData.hospital_name}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>
                            Hospital Address    
                        </label>
                        <input
                            className={styles.input}
                            name="hospital_address"
                            placeholder="123 Medical Dr, City, State 12345"
                            value={formData.hospital_address}
                            onChange={handleChange}
                        />
                    </div>
                </div>
            </div>

            {error && <p className={styles.error}>{error}</p>}
            <button
                onClick={handleSubmit}
                disabled={loading}
                className={`${styles.submitBtn} ${loading ? styles.submitBtnDisabled: ''}`}
            >
                {loading ? 'Generating Letter...': 'Generate Appeal Letter'}
            </button>
        </div>

    )
}