'use client'
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts"
import styles from "./dashboard.module.css"
import Spinner from "../components/Spinner/Spinner"

const COLORS = ['#02c39a', '#0a2342', '#028090', '#5a7a8a', '#8eaab5']
const MONO = 'Courier New, monospace'
const SERIF = 'var(--font-inter), sans-serif'


const tooltipStyle = {
    borderRadius: '8px',
    border: '1px solid #e8f0f3',
    backgroundColor: '#0a2342',
    color: '#ffffff',
    fontFamily: SERIF,
    fontSize: '0.85rem',
}

export default function Dashboard() {
    const [records, setRecords] = useState([])
    const [loading, setLoading] = useState(true)
    const { user } = useUser()
    const router = useRouter()

    useEffect(() => {
        document.title = 'Dashboard | MedVoice'
        if (!user) return

        const fetchHistory = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/history/${user.id}`)
                const data = await res.json()
                setRecords(data)
            } catch (err) {
                console.error('Failed to fetch history', err)
            } finally {
                setLoading(false)
            }
        }
        fetchHistory()
    }, [user])

    const totalSpent = records.reduce((sum, r) => {
        const amount = parseFloat(r.total_amount?.replace(/[^0-9.]/g, '') || 0)
        return sum + amount
    }, 0)

    const spendingOverTime = records
        .slice()
        .reverse()
        .map((r) => ({
            date: new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            amount: parseFloat(r.total_amount?.replace(/[^0-9.]/g, '') || 0),
        }))

    const chargeFrequency = {}
    records.forEach((r) => {
        r.charges?.forEach((c) => {
            const name = c.name?.length > 60 ? c.name.substring(0, 60) + '...' : c.name
            chargeFrequency[name] = (chargeFrequency[name] || 0) + 1
        })
    })

    const topCharges = Object.entries(chargeFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }))

    const languageData = {}
    records.forEach((r) => {
        const lang = r.language?.toUpperCase() || 'EN'
        languageData[lang] = (languageData[lang] || 0) + 1
    })

    const pieData = Object.entries(languageData).map(([name, value]) => ({ name, value }))
    const totalFlags = records.reduce((sum, r) => sum + (r.red_flags?.length || 0), 0)

    return (
        <main className={styles.main}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <button onClick={() => router.push('/')} className={styles.backBtn}>
                        ← Back to home
                    </button>
                    <div className={styles.logo}>
                        <span className={styles.logoIcon}>+</span>
                        <span className={styles.logoText}>MedVoice</span>
                    </div>
                </div>

                <p className={styles.title}>Your Dashboard</p>
                <p className={styles.subtitle}>An overview of all your bill analyses</p>

                {loading ? <Spinner message="Loading your dashboard..." /> : (
                    <>
                        {/* Stats row */}
                        <div className={styles.statsRow}>
                            <div className={styles.statCard}>
                                <p className={styles.statValue}>{records.length}</p>
                                <p className={styles.statLabel}>Total Bills Analyzed</p>
                            </div>
                            <div className={styles.statCard}>
                                <p className={styles.statValue}>${totalSpent.toFixed(2)}</p>
                                <p className={styles.statLabel}>Total Amount Across Bills</p>
                            </div>
                            <div className={styles.statCard}>
                                <p className={styles.statValue}>{totalFlags}</p>
                                <p className={styles.statLabel}>Total Red Flags Detected</p>
                            </div>
                            <div className={styles.statCard}>
                                <p className={styles.statValue}>
                                    {records.length > 0 ? `$${(totalSpent / records.length).toFixed(2)}` : '$0'}
                                </p>
                                <p className={styles.statLabel}>Average Bill Amount</p>
                            </div>
                        </div>

                        {/* Spending over time */}
                        {spendingOverTime.length > 0 && (
                            <div className={styles.chartCard}>
                                <p className={styles.chartTitle}>Spending Over Time</p>
                                <div style={{ overflowX: 'auto' }}>
                                    <div style={{minWidth:'400px'}}>
                                        <ResponsiveContainer width="100%" height={250}>
                                            <LineChart data={spendingOverTime} style={{ outline: 'none' }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e8f0f3" />
                                                <XAxis
                                                    dataKey="date"
                                                    tick={{ fontSize: 12, fill: '#5a7a8a', fontFamily: MONO }}
                                                />
                                                <YAxis
                                                    tick={{ fontSize: 12, fill: '#5a7a8a', fontFamily: MONO }}
                                                />
                                                <Tooltip
                                                    formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Amount']}
                                                    contentStyle={tooltipStyle}
                                                    labelStyle={{ color: '#02C39A', fontWeight: 'bold' }}
                                                    itemStyle={{ color: '#ffffff' }}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="amount"
                                                    stroke="#02C39A"
                                                    strokeWidth={2}
                                                    dot={{ fill: '#02C39A', r: 4 }}
                                                    activeDot={{ r: 6 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Top charges */}
                        {topCharges.length > 0 && (
                            <div className={styles.chartCard}>
                                <p className={styles.chartTitle}>Most Common Charges</p>
                                <div style={{ overflowX: 'auto' }}>
                                    <div style={{ minWidth: '500px' }}>
                                        <ResponsiveContainer width="100%" height={350}>
                                            <BarChart data={topCharges} layout="vertical" margin={{ left: 10 }} style={{ outline: 'none' }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e8f0f3" />
                                                <XAxis
                                                    type="number"
                                                    tick={{ fontSize: 12, fill: '#5a7a8a', fontFamily: MONO }}
                                                />
                                                <YAxis
                                                    dataKey="name"
                                                    type="category"
                                                    tick={{ fontSize: 11, fill: '#5a7a8a', fontFamily: MONO }}
                                                    width={200}
                                                />
                                                <Tooltip
                                                    formatter={(value) => [value, 'Times']}
                                                    contentStyle={tooltipStyle}
                                                    labelStyle={{ color: '#02C39A', fontWeight: 'bold' }}
                                                    itemStyle={{ color: '#ffffff' }}
                                                />
                                                <Bar dataKey="count" fill="#02C39A" radius={[0, 4, 4, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Language breakdown */}
                        {pieData.length > 1 && (
                            <div className={styles.chartCard}>
                                <p className={styles.chartTitle}>Bills by Language</p>
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={90}
                                            dataKey="value"
                                            label={({ name, percent }) =>
                                                `${name} ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {pieData.map((_, index) => (
                                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={tooltipStyle}
                                            itemStyle={{ color: '#ffffff' }}
                                        />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {/* Empty state */}
                        {records.length === 0 && (
                            <div className={styles.emptyState}>
                                <p className={styles.emptyIcon}>📊</p>
                                <p className={styles.emptyTitle}>No data yet</p>
                                <p className={styles.emptyDesc}>Analyze your first bill to see your dashboard</p>
                                <button onClick={() => router.push('/')} className={styles.uploadBtn}>
                                    Analyze a Bill
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </main>
    )
}