import tu from "@/assets/logos/tu.png";
import stat from "@/assets/img/stat-bg.png";
import { Link } from "react-router";

const StatCard = (props) => {
  return (
    <Link to={props.link} style={{width: "100%"}}>

    <div
      style={{
        backgroundImage: `url(${stat})`, 
        backgroundSize: "cover", // Changed to 'cover' for better background fitting
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center", // Ensures a well-positioned background
      }}
      className="lg:max-w-72  w-full p-3 max-h-max rounded-md border bg-slate-50 border-slate-200"
      >
      <div className="grid grid-cols-3">
        <div className="col-span-1">
          <div className="w-16 h-16 flex items-center justify-center bg-white rounded-md">
            {props.icon ? (
              props.icon
            ) : (
              <img src={tu} className="w-12 h-12 object-contain mx-auto" alt="Logo" />
            )}
          </div>
        </div>
        <div className="col-span-2">
          <span className="text-sm font-medium text-slate-500">{props.title}</span>
          <p className="text-3xl font-semibold text-slate-700">{props.value}</p>
        </div>
      </div>
    </div>
    </Link>      
  );
};

export default StatCard;
