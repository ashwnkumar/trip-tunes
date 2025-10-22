import InputComponent from '@/components/form/InputComponent'
import { Button } from '@/components/ui/button'
import { envConfig } from '@/lib/envConfig'
import React, { useState } from 'react'

function Playlist() {
    const [query, setQuery] = useState('')
    const [result, setResult] = useState([])

    const handleSearch = async () => {
        const qu = encodeURIComponent(query)
        try {

            const res = await fetch(`https://api.spotify.com/v1/search?q=${qu}&type=track&limit=10`, {
                headers: {
                    'Authorization': `Bearer ${envConfig.SPOTIFY_ACCESS_TOKEN}`
                }
            })

            const data = await res.json()
            setResult(data.tracks.items)

        }
        catch (error) {

        }

    }

    return (
        <div>Playlist
            <InputComponent id='query' name='query' value={query} onChange={(e) => setQuery(e.target.value)} label='Song' />
            <Button onClick={handleSearch}>
                Search
            </Button>
        </div>
    )
}

export default Playlist