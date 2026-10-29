/**
 * @file BlogCard.jsx
 * @description Blog post preview card featuring image thumbnail, title, truncated summary, category, read time, and click handler.
 * @architecture Used in blog feeds, carousels, or landing pages to present bite-sized article cards.
 * @agent_note Supports snap-scrolling layout contexts (`snap-start scroll-ml-6 shrink-0`). Ensure image URLs are valid or provide fallback handlers if needed.
 */

import React from "react";

/**
 * @component BlogCard
 * @description Renders a blog preview card with hover zoom effects, metadata tags, and selection callback.
 * @param {Object} props - Component properties
 * @param {string} props.title - Headline title of the blog post
 * @param {string} props.description - Brief snippet or summary of the article (line-clamped to 3 lines)
 * @param {string} props.category - Article category or domain taxonomy
 * @param {number|string} props.readTime - Estimated read time in minutes
 * @param {string} props.image - URL or path of the blog hero/cover image
 * @param {Function} [props.onClick] - Click callback invoked when the card is clicked
 * @state None - Pure presentation component
 */
const BlogCard = ({ title, description, category, readTime, image, onClick }) => {
  return (
    <div
      className="relative snap-start scroll-ml-6 shrink-0 first:pl-6 last:pr-6 cursor-pointer"
      onClick={onClick}
    >
      <div className="relative flex flex-col overflow-hidden transition-all duration-200 transform bg-white border border-gray-100 shadow w-60 md:w-80 group rounded-xl hover:shadow-lg hover:-translate-y-1">
        <div className="flex shrink-0 aspect-w-4 aspect-h-3">
          <img
            className="object-cover w-full h-full transition-all duration-200 transform group-hover:scale-110"
            src={image}
            alt={title}
          />
        </div>
        <div className="flex-1 px-4 py-5 sm:p-6">
          <p className="text-lg font-bold text-gray-900">{title}</p>
          <p className="mt-3 text-sm font-normal leading-6 text-gray-500 line-clamp-3">
            {description}
          </p>
        </div>
        <div className="px-4 py-5 mt-auto border-t border-gray-100 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium text-gray-900">{category}</p>
              <span className="text-sm font-medium text-gray-900">•</span>
              <p className="text-sm font-medium text-gray-900">{readTime} Mins Read</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;
