import { Link } from 'react-router';
import { GoArrowUpRight } from "react-icons/go";

const Button = ({children, path,bgColor,color,iconColor,border,borderColor, onClick}) => {
  return (
    <Link to={path}>
      <button onClick={onClick} style={{backgroundColor: bgColor,color: color,borderColor: borderColor?borderColor:'', border:border?border:0}} className={`rounded-full min-w-20 relative px-2 py-2.5 overflow-hidden group bg-[${bgColor}] text-white hover:ring-2  ${borderColor?borderColor:''} hover:ring-offset-2 hover:ring- transition-all ease-out duration-300`}>
      <span className="absolute right-0 w-8 h-32 -mt-12 transition-all duration-1000 transform translate-x-12 bg-white opacity-20 rotate-12 group-hover:-translate-x-40 ease"></span>
      <div className='grid grid-cols-3 gap-x-2 place-content-center'>
        <div className="col-span-2 self-center font-light">
          {children}
        </div>
        <div className='self-center'>
          <span style={{backgroundColor: color}} className={`w-8 h-8 rounded-full flex justify-center items-center`}>
            <GoArrowUpRight className=' inline-block group-hover:rotate-45 duration-75' size={20} color={iconColor} />
          </span>
        </div>
      </div>
      </button>
    </Link>

  )
}

export default Button
