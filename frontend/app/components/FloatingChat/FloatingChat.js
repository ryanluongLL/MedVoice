'use client'
import { useState, useRef, useEffect } from 'react'
import styles from './FloatingChat.module.css'

const SUGGESTED_QUESTIONS = [
    "What is the most expensive charge?",
    "Can I dispute any of these charges",
    "What should I do about the red flags",
    "How do I contact my insurance",
]

export default function FloatingChat() {
    const [open, setOpen] = useState(false)
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hi! I can answer questions about your most recent bill analysis. Ask me anything!" }
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [analysis, setAnalysis] = useState(null)
    const bottomRef = useRef(null)
    const isFirstRender = useRef(true)

    useEffect(() => {
        const stored = localStorage.getItem('billAnalysis')
        if (stored) setAnalysis(JSON.parse(stored))
    }, [open])

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false
            return
        }
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const sendMessage = async (question) => {
        const userQuestion = question || input.trim()
        if (!userQuestion || loading) return

        if (!analysis) {
            setMessages(prev => [...prev,
                { role: 'user', content: userQuestion },
                { role: 'assistant', content: "I don't have any bill data yet. Please analyze a bill first!" }
            ])
            setInput('')
            return
        }

        const userMessage = { role: 'user', content: userQuestion }
        const updatedMessages = [...messages, userMessage]
        setMessages(updatedMessages)
        setInput('')
        setLoading(true)

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: userQuestion,
                    bill_context: analysis,
                    history: messages.filter((_, i) => i !== 0),
                }),
            })
            const data = await res.json()
            setMessages([...updatedMessages, { role: 'assistant', content: data.answer }])
        } catch (err) {
            setMessages([...updatedMessages, {
                role: 'assistant',
                content: 'Sorry, something went wrong. Please try again.'
            }])
        } finally {
            setLoading(false)
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    return (
        <>
            {/* Chat panel */}
            {open && (
                <div className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <div className={styles.panelTitle}>
                            <span className={styles.panelIcon}>＋</span>
                            <span>MedVoice Assistant</span>
                        </div>
                        <button onClick={() => setOpen(false)} className={styles.closeBtn}>✕</button>
                    </div>

                    {messages.length === 1 && (
                        <div className={styles.suggestions}>
                            {SUGGESTED_QUESTIONS.map((q) => (
                                <button
                                    key={q}
                                    onClick={() => sendMessage(q)}
                                    className={styles.suggestionBtn}
                                    disabled={loading}
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    )}


                    <div className={styles.messages}>
                        {messages.map((msg, i) => (
                            <div key={i} className={`${styles.message} ${msg.role === 'user' ? styles.userMessage : styles.assistantMessage}`}>
                                {msg.role === 'assistant' && (
                                    <span className={styles.avatar}>＋</span>
                                )}
                                <p className={styles.messageText}>{msg.content}</p>
                            </div>
                        ))}
                        {loading && (
                            <div className={`${styles.message} ${styles.assistantMessage}`}>
                                <span className={styles.avatar}>＋</span>
                                <div className={styles.typing}>
                                    <span /><span /><span />
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    <div className={styles.inputRow}>
                        <input
                            className={styles.input}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask about your bill..."
                            disabled={loading}
                        />
                        <button
                            onClick={() => sendMessage()}
                            disabled={!input.trim() || loading}
                            className={`${styles.sendBtn} ${!input.trim() || loading ? styles.sendBtnDisabled : ''}`}
                        >
                            →
                        </button>
                    </div>
                </div>
            )}

            {/* Bubble button */}
            <button
                onClick={() => setOpen(!open)}
                className={styles.bubble}
            >
                {open ? '✕' : '💬'}
            </button>
        </>
    )
}