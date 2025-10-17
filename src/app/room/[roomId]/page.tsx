import React from 'react'

async function page({ params }: { params: Promise<{ roomId: string }> }) {
    const { roomId } = await params;
    console.log(roomId);
    return (
        <div>page</div>
    )
}

export default page