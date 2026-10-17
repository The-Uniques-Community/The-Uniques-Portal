import React from "react";
import Slider from "react-slick";
import { Box, Card, CardMedia, CardContent, Typography } from "@mui/material";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

const AutoSlider = () => {
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
    responsive: [
      {
        breakpoint: 960, // Adjust for tablet
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 600, // Adjust for mobile
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  const cards = [
    {
      title: "How to write content about your photographs",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sit quis auctor odio arcu et dolor.",
      image: "https://landingfoliocom.imgix.net/store/collection/clarity-blog/images/hero/4/thumbnail-1.png",
      category: "Growth",
      time: "7 Mins Read",
    },
    {
      title: "Tips for perfect landscape shots",
      description: "Discover techniques to enhance your landscape photography and create stunning visuals.",
      image: "https://landingfoliocom.imgix.net/store/collection/clarity-blog/images/hero/4/thumbnail-2.png",
      category: "Photography",
      time: "8 Mins Read",
    },
    {
      title: "Mastering the art of portrait photography",
      description: "Learn how to capture captivating portraits with ease and creativity.",
      image: "https://landingfoliocom.imgix.net/store/collection/clarity-blog/images/hero/4/thumbnail-3.png",
      category: "Creativity",
      time: "5 Mins Read",
    },
  ];

  return (
    <Box sx={{ maxWidth: "100%", mx: "auto", p: 2 }}>
      <Slider {...sliderSettings}>
        {cards.map((card, index) => (
          <Card
            key={index}
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              p: 2,
              mx: 1,
              boxShadow: 3,
              transition: "transform 0.3s ease",
              "&:hover": { transform: "translateY(-10px)", boxShadow: 6 },
            }}
          >
            <CardMedia
              component="img"
              image={card.image}
              alt={card.title}
              sx={{
                height: 0,
                paddingTop: "56.25%",
                transition: "transform 0.3s ease",
                "&:hover": { transform: "scale(1.05)" },
              }}
            />
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {card.title}
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                {card.description}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {card.category} • {card.time}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Slider>
    </Box>
  );
};

export default AutoSlider;
