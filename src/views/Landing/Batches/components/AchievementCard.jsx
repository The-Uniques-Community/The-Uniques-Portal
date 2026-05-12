import React from "react"

// interface AchievementCardProps {
//   title: string
//   description: string
//   icon: React.ReactNode
//   color: string
// }

const AchievementCard = ({ title, description, icon, color }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
      <div className={`${color} text-white p-2  rounded-full w-10 h-10 flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  )
}

export default AchievementCard

