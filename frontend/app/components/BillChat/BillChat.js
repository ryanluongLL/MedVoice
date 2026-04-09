'use client'
import { useState, useRef, useEffect } from "react"
import styles from './BillChat.module.css'

const SUGGESTED_QUESTIONS = [
    "What is the most expensive charge?",
    "Can I dispute any of these charges",
    "What should I do about the red flags",
    "How do I contact my insurance",
]

export default function BillChat({ analysis }){
    const [messages, setMessage] = useState([
        {
            role: 'assistant',
            content: "Hi! I've analyzed your bill. Fell free to ask me anything about the charges, red flags, or what steps you should take next.",
        }
    ])

    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const bottomRef = useRef(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({behavior: 'smooth'})
    }, [messages])

    const sendMessage = async (question) => {
        const userQuestion = question || input.trim()
        if (!userQuestion || loading) return

        const userMessage = { role: 'user', content: userQuestion }
        const updatedMessages = [...messages, userMessage]
        setMessage(updatedMessages)
        setInput('')
        setLoading(true)

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: userQuestion,
                    bill_context: analysis,
                    history: messages.filter(m => m.role !== 'assistant' || messages.indexOf(m) !== 0),
                }),
            })

            const data = await res.json()
            setMessage([...updatedMessages, {role:'assistant', content:data.answer}])
        } catch (err) {
            setMessage([...updatedMessages, {
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
        <div className={styles.wrapper}>
            <p className={styles.title}>💬 Ask about your bill</p>

            {/* suggested questions */}
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

            {/* chat message */}
            <div className={styles.chatBox}>
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`${styles.messages} ${msg.role === 'user' ? styles.userMessage : styles.assistantMessage}`}
                    >
                        {msg.role === 'assistant' && (
                            <span className={styles.avatar}>+</span>
                        )}
                        <p className={styles.messageText}>{msg.content}</p>
                    </div>
                ))}
                
                {loading && (
                    <div className={`${styles.message} ${styles.assistantMessage}`}>
                        <span className={styles.avatar}>+</span>
                        <div className={styles.typingIndicator}>
                            <span />
                            <span />
                            <span />
                        </div>
                    </div>
                )}
                
                <div ref={bottomRef} />
            </div>

            {/* input */}
            <div className={styles.inputRow}>
                <input
                    className={styles.input}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask anything about your bill..."
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
    )
}