import React from 'react'
import Header from '@/utils/Header'
import FourPhase from './components/FourPhase'
import trainingMethod from '@/assets/img/trainingMethod.png'
import Trainingculture from './components/Trainingculture'
import CallToAction from '../homComponents/CallToAction'
import TrainingTimeline from './components/TrainingTimeLine'
import Trainers from './components/Trainers'

const Training = () => {
  return (
	<div>
		<Header 
		  title = "Training Model → The Uniques ✦"
		  subtitle = "Training in"
		  chipLabel = "4 Phases"
		  backgroundColor = "#f1f4f9"
		  highlightColor = "#ca0019"
		/>
		<div className='p-10 '></div>
		<FourPhase />
		<div className='p-10 '></div>
		<Trainingculture />
		<div className='container w-9/12 mx-auto px-4 py-8'>
			<img src={trainingMethod} />
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
