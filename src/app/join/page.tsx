"use client"
import InputComponent from '@/components/form/InputComponent'
import { Button } from '@/components/ui/button'
import { useGlobal } from '@/contexts/GlobalContext'
import { supabase } from '@/lib/supabaseClient'
import { redirect, useSearchParams } from 'next/navigation'
import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { toast } from 'sonner'

function page() {
    const { loading, setLoading, roomData, setRoomData } = useGlobal()
    const searchParams = useSearchParams()
    const roomCode = searchParams.get('code')

    const [name, setName] = useState<string>('')

    const handleSubmit = async (e: ChangeEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const { data, error } = await supabase
            .from('members')
            .insert([{ name, room_id: roomData?.id }])
            .select()
            .single()
        if (error) {
            console.log(error)
            toast.error(error.message || "Something went wrong")
            return
        }
        toast.success("Joined room successfully!")
        setLoading(false)
        setName('')
        setRoomData(null)
        localStorage.setItem('member', JSON.stringify(data))
        redirect(`/room/${roomData?.id}`)

    }


    const init = async () => {
        setLoading(true)
        const local = JSON.parse(localStorage.getItem('member') || '{}')
        if (local) {
            const { data: existing } = await supabase
                .from('members')
                .select('*')
                .eq('id', local.id)
                .single()

            if (existing) {
                toast.success(`Welcome back ${existing.name}!`)
                redirect(`/room/${existing.room_id}`)
            }
        }

        const { data, error } = await supabase
            .from('rooms')
            .select('*')
            .eq('room_code', roomCode)
            .single()
        if (error) {
            console.log(error)
            toast.error(error.message || "Something went wrong")
            return
        }
        setRoomData(data)
        toast.success("Room found! Ready to join")
        setLoading(false)
    }

    useEffect(() => {
        if (roomCode) {
            init()
        }
    }, [roomCode])

    return (
        <div className="w-full">
            {loading ? (
                <div className='w-full h-full flex justify-center items-center'>
                    <p>Loading...</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} action="" className='space-y-2 w-full'>
                    <InputComponent
                        label='Name'
                        placeholder='Enter your name'
                        type='text'
                        id='name'
                        name='name'
                        className='w-full'
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <Button disabled={!roomData || !name || loading} type='submit' className='w-full'>
                        Join Room
                    </Button>
                </form>
            )}
        </div>
    )
}

export default page

