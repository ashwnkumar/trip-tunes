import Link from 'next/link'
import React from 'react'

function Footer() {
    return (
        <div className="w-full flex flex-col items-center justify-center gap-2">
            <p>2025 Trip Tunes. All Rights Reserved.</p>
            <p>Designed and Developed by <Link href='https://www.ashwinkumar-dev.vercel.app'>Ashwin Kumar</Link>.</p>
        </div>
    )
}

export default Footer