import { SignIn } from '@clerk/nextjs'

export default function Page() {
    return (
        <main style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0a2342 0%, #0d2f50 50%, #0a3d4a 100%)',
        }}>
            <SignIn />
        </main>
    )
}