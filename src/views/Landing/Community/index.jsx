import CommunityCard from "@/components/cards/CommunityCard";
import WeirdCard from "@/components/cards/WeirdCard";
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
