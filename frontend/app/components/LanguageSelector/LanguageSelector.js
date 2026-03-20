"use client"
import styles from "./LanguageSelector.module.css"

const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'zh', label: '中文' },
    { code: 'vi', label: 'Tiếng Việt' },
    { code: 'ko', label: '한국어' },
    { code: 'tl', label: 'Filipino' },
    { code: 'ar', label: 'العربية' },
    { code: 'fr', label: 'Français' },
]

export default function LanguageSelector({ selected, onChange }) {
    return (
        <div className={styles.wrapper}>
            <label className={styles.label}>Analysis Language</label>
            <div className={styles.grid}>
                {LANGUAGES.map((lang) => (
                    <button
                        key={lang.code}
                        onClick={() => onChange(lang.code)}
                        className={`${styles.btn} ${selected === lang.code ? styles.btnActive : ''}`}
                    >
                        {lang.label}
                    </button>
                ))}
            </div>
        </div>
    )
}
