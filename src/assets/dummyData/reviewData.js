/**
 * @file reviewData.js
 * @description Mock testimonial and peer feedback fixtures celebrating member growth, technical mentoring, and community achievements.
 * @architecture Supplies testimonial card carousels on the public landing page and social proof components across the portal.
 * @agent_note Each review record specifies member name, professional role, company affiliation, avatar avatar URL, star rating, and testimonial commentary.
 */

/**
 * @desc Collection of student and alumni testimonial review objects with ratings and company titles.
 * @type {Array<{name: string, title: string, company: string, image: string, review: string, rating: number, date: string}>}
 */
export const reviews = [
    {
      name: 'Alice Johnson',
      title: 'Frontend Developer',
      company: 'TechSphere',
      image: 'https://avatar.iran.liara.run/public/boy?username=Ash',
      review: 'The community has helped me learn so much about React and Tailwind. The resources here are amazing!',
      rating: 5,
      date: 'January 15, 2025'
    },
    {
      name: 'Michael Smith',
      title: 'Backend Engineer',
      company: 'CodeHub',
      image: 'https://avatar.iran.liara.run/public/boy?username=Ash',
      review: 'I love the way this community shares backend tips and tricks. A great place to grow as a developer.',
      rating: 4.5,
      date: 'February 02, 2025'
    },
    {
      name: 'Rachel Adams',
      title: 'Full Stack Developer',
      company: 'Innovatech',
      image: 'https://avatar.iran.liara.run/public/boy?username=Ash',
      review: 'The best platform for learning about MERN stack development. The support from peers is incredible.',
      rating: 5,
      date: 'March 10, 2025'
    },
    {
      name: 'David Lee',
      title: 'Data Scientist',
      company: 'AI Pioneers',
      image: 'https://avatar.iran.liara.run/public/boy?username=Ash',
      review: 'Great place to collaborate on data science projects and find like-minded professionals!',
      rating: 4,
      date: 'April 05, 2025'
    },
    {
      name: 'Jessica Wang',
      title: 'DevOps Engineer',
      company: 'CloudMasters',
      image: 'https://avatar.iran.liara.run/public/boy?username=Ash',
      review: 'Amazing community for learning cloud technologies and improving your DevOps skills.',
      rating: 4.5,
      date: 'May 18, 2025'
    },
    {
      name: 'Ethan Carter',
      title: 'UI/UX Designer',
      company: 'DesignLytics',
      image: 'https://avatar.iran.liara.run/public/boy?username=Ash',
      review: 'The design discussions in this community have really helped me sharpen my UI/UX skills.',
      rating: 5,
      date: 'June 27, 2025'
    }
  ]