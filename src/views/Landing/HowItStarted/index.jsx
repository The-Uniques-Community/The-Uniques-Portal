import React from 'react'
import ModernHeader from "@/utils/Header/ModernHeader";
import TimeLine from "@/views/Landing/HowItStarted/components/TimeLine"
import CallToAction from '../homComponents/CallToAction'
import Flight from './components/Flight'

const index = () => {
    return (
        <div>
            <ModernHeader 
                title="Uniques’ Odyssey → Idea to Impact ✦"
                subtitle="The story of how The Uniques community started and grew."
            />
            <TimeLine />
            <Flight />
            <CallToAction />
        </div>
    )
}

export default index
