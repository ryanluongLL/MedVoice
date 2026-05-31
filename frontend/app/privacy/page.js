import styles from './privacy.module.css'

export default function Privacy() {
    return (
        <main className={styles.main}>
            <div className={styles.container}>
                <h1 className={styles.title}>Privacy Policy</h1>
                <p className={styles.updated}>Last updated: April 2026</p>

                <section className={styles.section}>
                    <h2>Who we are</h2>
                    <p>MedVoice is a personal project built to help people understand their medical bills. It is not a commercial product or healthcare provider.</p>
                </section>

                <section className={styles.section}>
                    <h2>What we collect</h2>
                    <ul>
                        <li>Your name and email address when you sign in via Clerk</li>
                        <li>The AI-generated analysis results of your bill (not the original file)</li>
                        <li>Basic usage analytics via Vercel Analytics</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2>What we do NOT collect</h2>
                    <ul>
                        <li>We never store your original bill files — they are analyzed in memory and immediately discarded</li>
                        <li>We never sell your data to anyone</li>
                        <li>We never share your data with third parties except the services listed below</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2>How your bill is processed</h2>
                    <p>When you upload a bill, the file is sent to our server, text is extracted, and that text is sent to Anthropic's Claude API for analysis. The original file is never saved. Only the structured analysis result is stored in our database tied to your account.</p>
                </section>

                <section className={styles.section}>
                    <h2>Third party services</h2>
                    <ul>
                        <li>Clerk — handles authentication (clerk.com/privacy)</li>
                        <li>Supabase — hosts our database (supabase.com/privacy)</li>
                        <li>Anthropic — processes bill text via Claude API (anthropic.com/privacy)</li>
                        <li>Vercel — hosts the frontend (vercel.com/legal/privacy-policy)</li>
                        <li>Google — provides Maps and Places API (policies.google.com/privacy)</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2>How to delete your data</h2>
                    <p>Email <strong>luongryanll@gmail.com</strong> with the subject "Delete my data" and we will delete your account and all associated analysis history within 7 days.</p>
                </section>

                <section className={styles.section}>
                    <h2>Contact</h2>
                    <p>Questions? Email luongryanll@gmail.com</p>
                </section>
            </div>
        </main>
    )
}