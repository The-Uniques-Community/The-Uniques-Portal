import { useTheme } from "@mui/material/styles";
import tu from "@/assets/logos/tu.png";
import stat from "@/assets/img/stat-bg.png";
import { Link } from "react-router";

const StatCard = (props) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Link to={props.link} style={{ width: "100%", textDecoration: "none" }}>
      <div
        style={{
          backgroundImage: `url(${stat})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundColor: isDark ? theme.palette.background.paper : theme.palette.background.default,
          borderColor: isDark 
            ? (props.bgColor?.includes("green") ? "rgba(76, 175, 80, 0.4)" 
              : props.bgColor?.includes("indigo") ? "rgba(63, 81, 181, 0.4)" 
              : props.bgColor?.includes("emerald") ? "rgba(16, 185, 129, 0.4)" 
              : props.bgColor?.includes("rose") ? "rgba(244, 67, 54, 0.4)" 
              : theme.palette.divider)
            : theme.palette.divider,
        }}
        className={`lg:max-w-72 w-full p-3 max-h-max rounded-md border ${isDark ? "" : (props.bgColor || "")}`}
      >
        <div className="grid grid-cols-3">
          <div className="col-span-1">
            <div
              style={{
                backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)",
              }}
              className="w-16 h-16 flex items-center justify-center rounded-md"
            >
              {props.icon ? (
                props.icon
              ) : (
                <img src={tu} className="w-12 h-12 object-contain mx-auto" alt="Logo" />
              )}
            </div>
          </div>
          <div className="col-span-2">
            <span
              style={{ color: theme.palette.text.secondary }}
              className="text-sm font-medium"
            >
              {props.title}
            </span>
            <p
              style={{ color: theme.palette.text.primary }}
              className="text-3xl font-semibold"
            >
              {props.value}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default StatCard;
