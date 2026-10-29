/**
 * @file Timeline.jsx
 * @description Milestone history timeline rendering alternating left/right event nodes with year tags, media thumbnails, narratives, and quote callouts.
 * @architecture Used in the "About Us" and community journey views to present chronological milestones.
 * @agent_note Paired with `Timeline.css` for zig-zag connector paths, tilt angles on start/end years, and responsive layout stacking.
 */

import React from 'react';
import './Timeline.css';

/**
 * @component Timeline
 * @description Chronological milestone timeline component with alternating cards, imagery, connector lines, and quotes.
 * @param {Object} props - Component properties
 * @param {Array<Object>} props.events - List of milestone events
 * @param {string|number} props.events[].year - Event year or timeframe label
 * @param {string} props.events[].image - Thumbnail image URL for the milestone
 * @param {string} props.events[].heading - Title heading of the event
 * @param {string} [props.events[].subheading] - Optional secondary heading
 * @param {string} props.events[].brief - Descriptive summary or narrative of the achievement
 * @param {string} [props.events[].quote] - Optional testimonial or historic quote
 * @param {string} [props.events[].quoteAuthor] - Author attribution for the quote
 * @state None - Pure presentation component
 */
const Timeline = ({ events }) => {
  if (!events || events.length === 0) return null;

  return (
    <div className="timeline-container">
      {events.map((event, index) => {
        const isFirst = index === 0;
        const isLast = index === events.length - 1;
        const isEven = index % 2 === 0;
        const hasNext = index < events.length - 1;
        
        return (
          <div key={index} className="timeline-item-wrapper">
            <div 
              className={`timeline-item ${isEven ? 'timeline-left' : 'timeline-right'}`}
            >
              {/* Year marker with dot */}
              <div className="timeline-dot">
                <span className="timeline-circle"></span>
                {(isFirst || isLast) ? (
                  <span className={`timeline-year-tilted ${isFirst ? 'first' : 'last'}`}>
                    {event.year}
                  </span>
                ) : (
                  <span className="timeline-year">{event.year}</span>
                )}
              </div>
              
              {/* Content */}
              <div className="timeline-content">
                <div className="timeline-image-container">
                  <img 
                    src={event.image} 
                    alt={event.heading} 
                    className="timeline-image" 
                  />
                </div>
                <div className="timeline-text">
                  <h3 className="timeline-heading">{event.heading}</h3>
                  <h4 className="timeline-subheading">{event.subheading}</h4>
                  <p className="timeline-brief">{event.brief}</p>
                  {event.quote && (
                    <blockquote className="timeline-quote">
                      <p>"{event.quote}"</p>
                      {event.quoteAuthor && <cite>— {event.quoteAuthor}</cite>}
                    </blockquote>
                  )}
                </div>
              </div>
            </div>
            
            {/* Connector line - only if not the last item */}
            {hasNext && (
              <div className={`timeline-connector ${isEven ? 'connector-right' : 'connector-left'}`}>
                <div className="connector-line"></div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Timeline;
