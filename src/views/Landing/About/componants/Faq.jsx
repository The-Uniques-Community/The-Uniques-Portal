import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";

const faqList = [
	
		{
		  "isActive": true,
		  "question": "What is Unques Community?",
		  "answer": "Unques Community is a vibrant platform where curious minds come together to share knowledge, explore unique ideas, and collaborate on innovative solutions."
		},
		{
		  "isActive": false,
		  "question": "Who is Unques Community for?",
		  "answer": "Unques Community welcomes everyone—from beginners to experts—who are passionate about learning, sharing, and growing in a supportive environment."
		},
		{
		  "isActive": false,
		  "question": "How does Unques Community work?",
		  "answer": "Members can post questions, share insights, and engage in discussions, while our team curates valuable resources to keep conversations fresh and inspiring."
		},
		{
		  "isActive": false,
		  "question": "How often do you update community resources?",
		  "answer": "We regularly update our resources to ensure the community stays informed with the latest trends, ideas, and innovative solutions."
		}
	  
	  
];

const FaqItem = ({ faq }) => {
	const [isOpen, setIsOpen] = useState(faq.isActive || false);

	const toggleFaq = () => setIsOpen(!isOpen);

	return (
		<div className={`${isOpen && "active"} rounded-lg`}>
			<a
				href="#!"
				className="btn p-4 lg:p-6 w-full text-start flex justify-between items-center cursor-pointer"
				onClick={toggleFaq}
			>
				<span>{faq.question}</span>
				<FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} />
			</a>
			{isOpen && (
				<div className="p-4 lg:p-6 bg-white shadow dark:shadow-none  rounded-xl">
					<p className="opacity-50">{faq.answer}</p>
				</div>
			)}
		</div>
	);
};

const Faq8 = () => {
	return (
		<section className="ezy__faq8 light py-14 md:py-24 bg-white   text-zinc-900  ">
			<div className="container px-16 md:px-8 lg:px-28">
				<div className="grid grid-cols-12 justify-between gap-6">
					<div className="col-span-12 md:col-span-5">
						<h2 className="font-bold text-[25px] md:text-[45px] leading-none mb-6">
							Frequently Asked Questions
						</h2>
						<p className="text-lg opacity-70">
							Assumenda non repellendus distinctio nihil dicta sapiente,
							quibusdam maiores, illum at, aliquid blanditiis eligendi qui.
						</p>
		
					</div>
					<div className="col-span-12 md:col-span-6 md:col-start-7">
						{faqList.map((faq, i) => (
							<FaqItem faq={faq} key={i} />
						))}
					</div>
				</div>
			</div>
		</section>
	);
};

export default Faq8;
