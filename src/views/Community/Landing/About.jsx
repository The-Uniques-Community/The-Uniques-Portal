import * as React from "react";

const About = (props) => (
    <div className="flex container mx-auto justify-center gap-16 md:flex-nowrap flex-wrap items-center pt-24">
        <div className="lg:w-1/2"><div className="lg:ml-auto  lg:mx-0  mx-auto">
            <svg
                width="100%"
                height="auto"
                viewBox="0 0 342 265"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                {...props}
            >
                <defs>
                    <clipPath id="aboutClip">
                        <path
                            d="M0 56V30C0 23.3726 5.37258 18 12 18H42C48.6274 18 54 23.3726 54 30V37C54 43.6274 59.3726 49 66 49H68C74.6274 49 80 43.6274 80 37V30C80 23.3726 85.3726 18 92 18H275C279.971 18 284 13.9706 284 9C284 4.02944 288.029 0 293 0H330C336.627 0 342 5.37258 342 12V79C342 85.6274 336.627 91 330 91H296C289.373 91 284 96.3726 284 103V167.5C284 169.985 286.015 172 288.5 172C290.985 172 293 169.985 293 167.5V151C293 144.373 298.373 139 305 139H330C336.627 139 342 144.373 342 151V181C342 187.627 336.627 193 330 193H304C297.925 193 293 197.925 293 204C293 210.075 297.925 215 304 215H330C336.627 215 342 220.373 342 227V253C342 259.627 336.627 265 330 265H305C298.373 265 293 259.627 293 253V232.5C293 230.015 290.985 228 288.5 228C286.015 228 284 230.015 284 232.5V253C284 259.627 278.627 265 272 265H92C85.3726 265 80 259.627 80 253V232C80 225.373 74.6274 220 68 220H35C28.3726 220 23 214.627 23 208V173.5C23 167.149 17.8513 162 11.5 162C5.14873 162 0 156.851 0 150.5V103C0 96.3726 5.37258 91 12 91H36.5C42.8513 91 48 85.8513 48 79.5C48 73.1487 42.8513 68 36.5 68H12C5.37258 68 0 62.6274 0 56Z"
                        />
                    </clipPath>
                </defs>
                {/* Image clipped to the custom path */}
                <image
                    href="https://studymelbourne.vic.gov.au/__data/assets/image/0009/2336490/Ambassadors-3.jpg"
                    width="342"
                    height="265"
                    preserveAspectRatio="xMidYMid slice"
                    clipPath="url(#aboutClip)"
                />
                {/* Optional overlay to emphasize the shape */}
                {/* <path
                d="M0 56V30C0 23.3726 5.37258 18 12 18H42C48.6274 18 54 23.3726 54 30V37C54 43.6274 59.3726 49 66 49H68C74.6274 49 80 43.6274 80 37V30C80 23.3726 85.3726 18 92 18H275C279.971 18 284 13.9706 284 9C284 4.02944 288.029 0 293 0H330C336.627 0 342 5.37258 342 12V79C342 85.6274 336.627 91 330 91H296C289.373 91 284 96.3726 284 103V167.5C284 169.985 286.015 172 288.5 172C290.985 172 293 169.985 293 167.5V151C293 144.373 298.373 139 305 139H330C336.627 139 342 144.373 342 151V181C342 187.627 336.627 193 330 193H304C297.925 193 293 197.925 293 204C293 210.075 297.925 215 304 215H330C336.627 215 342 220.373 342 227V253C342 259.627 336.627 265 330 265H305C298.373 265 293 259.627 293 253V232.5C293 230.015 290.985 228 288.5 228C286.015 228 284 230.015 284 232.5V253C284 259.627 278.627 265 272 265H92C85.3726 265 80 259.627 80 253V232C80 225.373 74.6274 220 68 220H35C28.3726 220 23 214.627 23 208V173.5C23 167.149 17.8513 162 11.5 162C5.14873 162 0 156.851 0 150.5V103C0 96.3726 5.37258 91 12 91H36.5C42.8513 91 48 85.8513 48 79.5C48 73.1487 42.8513 68 36.5 68H12C5.37258 68 0 62.6274 0 56Z"
                fill="#FF5733"
                fillOpacity="0.5"
            /> */}
            </svg>
        </div>
        </div>
        <div className="md:w-1/2 p-4">
            <div className=" text-left">
                <p className="bg-[#ca0019] md:text-left p-2 text-2xl text-white">
                    What is the Criteria for Being an Ambassador?
                </p>
                <p className="text-black text-sm text-left my-4">
                    <strong>Minimum One Year Until Graduation:</strong> Applicants should have at least one year remaining until graduation from their undergraduate or graduate program.
                </p>
                <p className="text-black text-sm text-left">
                    <strong>Full-Time Enrollment:</strong> Applicants must be enrolled full-time in an undergraduate or graduate program at a college or university.
                </p>
                <p className="text-black text-sm text-left">
                    <strong>Commitment:</strong> Individuals must commit to the program for a minimum of one year, demonstrating dedication to their role as a Lead.
                </p>
                <p className="text-black text-sm text-left">
                    <strong>Passion for Impact:</strong> Applicants should be passionate about creating a positive impact within their community and fostering growth and collaboration among peers.
                </p>
                <p className="text-black text-sm text-left">
                    <strong>Technical Understanding:</strong> Individuals should possess a foundational understanding of computer programming and/or software engineering concepts.
                </p>
                <p className="text-black text-sm text-left">
                    <strong>Event Planning Experience:</strong> Preference will be given to applicants with prior experience in event planning or leading a team.
                </p>
                <p className="text-black text-sm text-left">
                    <strong>Connection to Local Developer Community:</strong> Applicants should have a connection to the local developer community.
                </p>

                {/* <div className="border border-1 border-r-0 border-l-0 border-[#5700FF] my-6">
                    <p className="bg-[#fdf5e2] md:text-left p-2 text-2xl rounded-xl">
                        Community Guidelines
                    </p>
                    <p className="text-black text-sm text-left my-4">
                        The Uniques Community is committed to fostering a safe, inclusive, and harassment-free environment for all participants. We believe that every individual deserves to participate in our events without fear of harassment, discrimination, or condescension.
                    </p>
                </div>

                <p className="bg-[#fdf5e2] md:text-left p-2 text-2xl rounded-xl">
                    Responsibilities of an Ambassador
                </p>
                <ul className="text-black text-sm text-left my-4 list-disc pl-5">
                    <li><strong>Host Regular Events:</strong> Organize and host events at least once a month.</li>
                    <li><strong>Report Activities:</strong> Regularly report your chapter's activities on the designated platform.</li>
                    <li><strong>Build a Core Team:</strong> Assemble a dedicated team to support event organization.</li>
                    <li><strong>Participate in Program Campaigns:</strong> Actively engage in initiatives led by The Unique Community.</li>
                    <li><strong>Engage with Regional Lead and Community Manager:</strong> Maintain regular communication for guidance and mentorship.</li>
                    <li><strong>Adhere to Code of Conduct:</strong> Uphold the Community Organizer Code of Conduct at all times.</li>
                </ul> */}
            </div>
        </div>

    </div >
);

export default About;
