import styles from "./privacy.module.css";

export const metadata = {
    title: "Privacy Policy",
    description: "What MedLedger collects: nothing. Here is exactly why.",

}

export default function Privacy() {
  return (
    <main className={styles.main}>
      <div className={styles.wrap}>

        <nav className={styles.nav}>
          <a href="/" className={styles.wordmark}>Med<span>Ledger</span></a>
          <a href="/" className={styles.backlink}>&larr; Back to checker</a>
        </nav>

        <div className={styles.content}>
          <div className={styles.eyebrow}>The short version</div>
          <h1 className={styles.h1}>We don&apos;t collect anything.</h1>
          <p className={styles.intro}>
            No account, no name, no email, no document upload. You enter a
            procedure code and a dollar amount, and neither is sent anywhere
            except to the calculation itself.
          </p>

          <section className={styles.section}>
            <h2 className={styles.h2}>What happens when you use this tool</h2>
            <p>
              The code and amount you enter are sent to our server, compared
              against the public CMS fee schedule, and a result is returned
              to your browser. Nothing about that request is written to a
              database, logged with your identity, or kept after the response
              is sent back.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>Why this is different from the tool this used to be</h2>
            <p>
              An earlier version of this project accepted uploaded medical
              bills and stored analysis history behind a login. We removed
              both. A procedure code and a dollar amount carry no personal or
              health information on their own, so there was nothing left to
              protect, and nothing worth asking you to trust us with.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>Cookies and analytics</h2>
            <p>
              This site does not set tracking cookies and does not run
              third-party analytics. If that changes, this page will change
              with it, and it will say so plainly, not bury it in a longer
              document.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>Questions</h2>
            <p>
              Reach out at{' '}
              <a href="mailto:luanluongforwork@gmail.com" className={styles.link}>
                luanluongforwork@gmail.com
              </a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}