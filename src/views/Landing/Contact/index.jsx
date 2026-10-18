import React from 'react'
import ContactForm from './components/ContactForm'
import ContainerFull from '@/components/layout/ContainerFull'
import CallToAction from '../homeComponents/CallToAction'
import CelebrationComponent from '@/components/headers/CelebrationHeader'

const index = () => {
  return (
    <div>
        <CelebrationComponent title='Connect & Collaborate → Reach Out ✦'/>
      <ContainerFull >
        <div className="py-7"></div>
          <ContactForm/>
        <div className="py-7"></div>
        <div className="py-7"></div>
      </ContainerFull>
        <CallToAction/>
    </div>
    
  )
}

export default index
