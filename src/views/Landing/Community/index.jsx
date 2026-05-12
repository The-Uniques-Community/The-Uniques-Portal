import CommunityCard from "@/utils/Card/CommunityCard";
import WeirdCard from "@/utils/Card/WeirdCard";
import { events } from "@/assets/dummyData/eventsData";
const index = () => {
  return (
    <div className="">
      <WeirdCard />
      <CommunityCard event={events[0]} />
    </div>
  )
}

export default index
