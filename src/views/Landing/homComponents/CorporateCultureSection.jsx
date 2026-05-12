import ShapedCard from "@/utils/Card/ShapedCard";
import { data } from "@/assets/dummyData/corporateModel";

const CorporateCultureSection = () => {
  return (
    <div className="lg:px-12 px-5 py-12">
      <div className="mb-6">
        <h2 className="text-4xl font-bold text-center">
          Corporate Culture
        </h2>
        <p className="text-center text-slate-600 lg:w-1/2 mx-auto mt-5">Lorem ipsum dolor sit amet consectetur adipisicing elit. Explicabo exercitationem molestias quidem. Consequatur magni quas sint eius maiores labore eum inventore quibusdam odio beatae, voluptas cupiditate mollitia, sunt fuga laboriosam ut cumque impedit?</p>
      </div>
      <div className="grid grid-cols-1 place-items-center gap-5 gap-y-10">
        <div>
          <div className="py-2 lg:px-32 lg:pt-24">
            <div className="-m-1 flex flex-wrap md:-m-2">
              <div className="flex w-1/2 flex-wrap">
                <div className="w-1/2 p-1 md:p-2">
                  <img
                    alt="gallery"
                    className="block h-full w-full rounded-lg object-cover object-center"
                    src="https://kmz0l2g36g.ufs.sh/f/szSqTLNNPY1rFaPv79IIxpXAlS9E6DJoyY3QtMN0RjmzOkh5"
                  />
                </div>
                <div className="w-1/2 p-1 md:p-2">
                  <img
                    alt="gallery"
                    className="block h-full w-full rounded-lg object-cover object-center"
                    src="https://tecdn.b-cdn.net/img/Photos/Horizontal/Nature/4-col/img%20(72).webp"
                  />
                </div>
                <div className="w-full p-1 md:p-2">
                  <img
                    alt="gallery"
                    className="block h-full w-full rounded-lg object-cover object-center"
                    src="https://kmz0l2g36g.ufs.sh/f/szSqTLNNPY1r3HHIkfTI4UXpNAM59VHStWu1E7iPx60mfLaJ"
                  />
                </div>
              </div>
              <div className="flex w-1/2 flex-wrap">
                <div className="w-full p-1 md:p-2">
                  <img
                    alt="gallery"
                    className="block h-full w-full rounded-lg object-cover object-center"
                    src="https://kmz0l2g36g.ufs.sh/f/szSqTLNNPY1reUQxhoyYLfOJra4m9kHCwZc8ne7y6BzUh1V5"
                  />
                </div>
                <div className="w-1/2 p-1 md:p-2">
                  <img
                    alt="gallery"
                    className="block h-full w-full rounded-lg object-cover object-center"
                    src="https://tecdn.b-cdn.net/img/Photos/Horizontal/Nature/4-col/img%20(75).webp"
                  />
                </div>
                <div className="w-1/2 p-1 md:p-2">
                  <img
                    alt="gallery"
                    className="block h-full w-full rounded-lg object-cover object-center"
                    src="https://tecdn.b-cdn.net/img/Photos/Horizontal/Nature/4-col/img%20(77).webp"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className="relative grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 place-items-center gap-x-16 gap-y-5">
            {data.map((item, index) => (
              <div key={index} className="lol">
                <ShapedCard heading={item.heading} content={item.content} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorporateCultureSection;
