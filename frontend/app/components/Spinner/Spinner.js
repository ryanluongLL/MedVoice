import styles from './Spinner.module.css'

export default function Spinner({ size = 40, color, message}) {
    const spinnerColor = color || '#02C39A'

    return (
        <div className={styles.wrapper}>
            <div
                className={styles.spinner}
                style={{
                    width: size,
                    height: size,
                    borderTopColor: spinnerColor,
                }}
            />
            {message && <p className={styles.message}>{message}</p>}
        </div>
    )
}