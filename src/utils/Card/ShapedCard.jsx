import bgImg from '@/assets/img/bg-slate.jpg'

const ShapedCard = ({heading, content}) => {
  return (
    <div className='relative w-full h-full'>
        <img className='corporate-clip w-full h-full object-cover object-center' src={bgImg} alt="" />
        <div className='absolute w-full top-1/2 left-1/2 transform -translate-x-1/2 p-3 -translate-y-1/2 text-center'>
            <h1 className='text-xl font-bold py-2 text-black'>{heading}</h1>
            <p className='text-red-500 p-3 text-sm w-full'>{content}</p>
        </div>
    </div>
  )
}

export default ShapedCard
