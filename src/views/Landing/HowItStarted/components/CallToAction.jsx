import Button from '@/utils/Buttons/Button'
import ContainerFull from '@/utils/Container/ContainerFull'

const CallToAction = () => {
    return (

        <ContainerFull bgColor={"white"} minHeight={"80vh"} >
            <div className='relative w-full mx-auto'>
                <img src="https://kmz0l2g36g.ufs.sh/f/szSqTLNNPY1rwhWULuzIBoNhPGFRMty2dXZHT8VQuqiwxelD" className='cta-clip w-full lg:h-36 h-40 object-cover' alt="" />
                <div className='absolute w-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center'>
                    <h1 className='text-4xl font-bold py-2 text-white'>Join Us Today</h1>
                    <p className='text-white p-3 text-lg'>Join the community of unique individuals and learn from the best</p>
                    <Button
                        path="/register"
                        color={"white"}
                        bgColor={"#ca0019"}
                        border={4}
                        borderColor={"#ca0019"}
                        iconColor={"black"}
                    >
                        <span>Register</span>
                    </Button>

                </div>
            </div>
        </ContainerFull>
    )
}

export default CallToAction
