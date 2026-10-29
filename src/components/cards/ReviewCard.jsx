/**
 * @file ReviewCard.jsx
 * @description Testimonial card showing reviewer avatar, name, company role, star ratings, review quote, and submission date.
 * @architecture Used in social proof sections, landing pages, and testimonial carousels.
 * @agent_note Computes star graphics dynamically up to a 5-star ceiling, supporting whole and half-star ratings.
 */

import React from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

/**
 * @component ReviewCard
 * @description Renders a testimonial review card with user attribution and star rating breakdown.
 * @param {Object} props - Component properties
 * @param {string} props.name - Reviewer or alumnus full name
 * @param {string} props.title - Job title / role of reviewer
 * @param {string} props.company - Employer or institution name
 * @param {string} props.image - Avatar image URL for the reviewer
 * @param {string} props.review - Full text body of the testimonial
 * @param {number} props.rating - Numerical rating value between 1 and 5 (supports half-steps)
 * @param {string} props.date - Publication or review date string
 * @state None - Pure presentation component
 */
const ReviewCard = ({ name, title, company, image, review, rating, date }) => {
  /**
   * @desc Renders a 5-element array of star icons based on rating number.
   * @param {number} rating - Rating score out of 5
   * @returns {Array<JSX.Element>} List of star icon elements
   */
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<FaStar key={i} className="text-yellow-500" />);
      } else if (i - 0.5 === rating) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-500" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-gray-400" />);
      }
    }
    return stars;
  };

  return (
    <div className='rounded-md min-w-[290px] min-h-64 relative shadow-md p-4 bg-white'>
      <div className='flex space-x-5 items-center'>
        <div>
          <img src={image} alt={name} className='w-16 h-16 rounded-full object-cover' />
        </div>
        <div>
          <h2 className='font-semibold text-lg'>{name}</h2>
          <p className='text-gray-500'>{title}, {company}</p>
        </div>
      </div>
      <div className='my-5'>
        <p className='text-sm text-slate-500'>{review}</p>
      </div>
      <div className='flex justify-between items-center absolute bottom-4 w-full right-0 left-0 px-4'>
        <div className='flex items-center space-x-1'>
          {renderStars(rating)}
        </div>
        <div>
          <p className='text-sm text-slate-500'>{date}</p>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
