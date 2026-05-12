import "./weirdcard.css";
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import tu_red from '@/assets/logos/tu-red.png'

const WeirdCard = () => {
  return (
    <div className="card group hover:cursor-pointer z-10 duration-100">
      <div class="top-section bg-slate-200">
        <div className="absolute flex justify-center items-center top-0 left-3 w-10 h-10 bg-black/80 rounded-full">
                <img className="w-6 object-center h-6 object-contain" src={tu_red} alt="" />
        </div>
        <div class="border2"></div>
        <div>
          <h2 className="absolute left-24 top-4 text-xl font-light">Basic Card Example</h2>
          <div class="bg-[#ca0019] h-[1px] absolute left-24 top-10 w-0 group-hover:w-1/2 transition-all duration-500"></div>
        </div>
        <p className="absolute left-5 right-4 top-[58px] text-sm font-light text-justify">Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam, placeat? Lorem ipsum dolor sit amet consectetur adipisicing.</p>
      </div>
      <div className="relative">
        <div className="px-2 bg-slate-200 flex justify-center items-center py-1 h-5 w-[70px] rounded-xl absolute bottom-0 z-10 right-0">
            <ArrowRightAltIcon className="text-black group-hover:text-2xl font-light duration-100"/>
        </div>
      </div>
    </div>
  );
};

export default WeirdCard;
