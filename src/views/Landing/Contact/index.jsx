import React from 'react'
import ContactForm from './components/ContactForm'
import ContainerFull from '@/utils/Container/ContainerFull'
import CallToAction from '../homComponents/CallToAction'
import CelebrationComponent from '@/utils/Header'

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
