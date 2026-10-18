import React from 'react'
import ModernHeader from '@/components/headers/ModernHeader';
import FourPhase from './components/FourPhase'
import TrainingFlow from './components/TrainingFlow'
import Trainingculture from './components/Trainingculture'
import CallToAction from '../homeComponents/CallToAction'
import TrainingTimeline from './components/TrainingTimeLine'
import Trainers from './components/Trainers'

const Training = () => {
  return (
	<div>
		<ModernHeader 
		  title = "Training Model → The Uniques ✦"
		  subtitle = "Training in 4 Phases"
		/>
		<div className='p-10 '></div>
		<FourPhase />
		<div className='p-10 '></div>
		<Trainingculture />
		<div className='container max-w-6xl mx-auto px-4 py-8'>
			<TrainingFlow />
		</div>
		<div className='p-10 '></div>
		<Trainers />
		<div className='p-10 '></div>
		<TrainingTimeline />
		<div className='p-10 '></div>
		<CallToAction/>
	</div>
  )
}

export default Training
