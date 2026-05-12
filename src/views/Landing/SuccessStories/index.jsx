import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomeContent from './HomeContent';
import StudentStory from './StudentStory';
import { successStories } from './successStoriesData';

// This component is now simpler since the layout is handled elsewhere
const SuccessStories = () => {
  return <HomeContent />;
};

export default SuccessStories;
