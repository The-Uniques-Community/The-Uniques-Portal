import Button from '@/utils/Buttons/Button'
import ContainerFull from '@/utils/Container/ContainerFull'

const CallToAction = () => {
  return (
    
        <div className='relative w-full mx-auto my-8'>
            <img src="https://kmz0l2g36g.ufs.sh/f/szSqTLNNPY1rwhWULuzIBoNhPGFRMty2dXZHT8VQuqiwxelD" className='cta-clip w-full lg:h-72 h-80 object-cover' alt="" />
            <div className='absolute w-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center'>
                <h1 className='text-4xl font-bold py-2 text-white'>
                  Join Us <span className='brush-bg text-white [--brush-color:#000]'>Today</span>
                </h1>
                <p className='text-white p-3 text-lg'>Join the community of unique individuals and learn from the best</p>
                <Button
                  path="/auth/login"
                  color={"white"}
                  bgColor={"#ca0019"}
                  border={4}
                  borderColor={"#ca0019"}
                  iconColor={"black"}
                >
                  <span>Login</span>
                </Button>

          </div>
        </div>

  )
}

export default CallToAction
