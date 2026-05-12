import React, { useState } from 'react';
import { Box, Typography, Paper, Chip, Fade } from '@mui/material';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';

const VideoMessage = ({ student, SectionHeading }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <Paper
    elevation={0}
    sx={{
      p: { xs: 3, md: 6 },
      borderRadius: 4,
      background: '#ffffff',
      boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)',
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s ease-in-out',
      '&:hover': {
        boxShadow: '0 30px 50px -15px rgba(202, 0, 25, 0.15)',
      }
    }}
  >
   

    {/* Background pattern */}
    <Box
      sx={{
        position: 'absolute',
        top: -20,
        right: -20,
        width: 200,
        height: 200,
        background: 'radial-gradient(circle at 30% 50%, rgba(202, 0, 25, 0.03) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none',
      }}
    />

    {/* Content */}
    <Box sx={{ position: 'relative', zIndex: 1 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Chip
            label="PERSONAL MESSAGE"
            size="small"
            sx={{
              bgcolor: 'rgba(202, 0, 25, 0.1)',
              color: '#ca0019',
              fontWeight: 600,
              fontSize: '0.7rem',
              letterSpacing: '0.5px',
            }}
          />
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              bgcolor: '#ca0019',
              opacity: 0.5,
            }}
          />
          <Typography variant="caption" sx={{ color: '#888', fontWeight: 500 }}>
            Exclusive Interview
          </Typography>
        </Box>

        <SectionHeading
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: 1,
            background: 'linear-gradient(135deg, #1a1a1a 0%, #ca0019 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-block'
          }}
        >
          Video Message
        </SectionHeading>
        
        <Typography 
          variant="body1" 
          sx={{ 
            maxWidth: '720px', 
            color: '#4a4a4a', 
            fontSize: '1.1rem',
            lineHeight: 1.6
          }}
        >
          Hear directly from <strong style={{ color: '#ca0019' }}>{student.name.split(' ')[0]}</strong> about the mindset, skills, and moments
          that shaped this remarkable journey.
        </Typography>
      </Box>

      {student.video ? (
        <Fade in timeout={500}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            {/* Video Container */}
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                maxWidth: 720,
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                border: '1px solid rgba(202, 0, 25, 0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: '0 30px 60px -12px rgba(202, 0, 25, 0.3)',
                }
              }}
            >
              {/* Video Element */}
              <Box
                component="video"
                key={student.id}
                controls
                preload="auto"
                playsInline
                src={student.video}
                onLoadedData={(event) => {
                  const video = event.currentTarget;
                  if (video.currentTime !== 0) {
                    video.currentTime = 0;
                  }
                  video.pause();
                  setIsPlaying(false);
                }}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                sx={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: 520,
                  display: 'block',
                  backgroundColor: '#000',
                  objectFit: 'contain',
                  borderRadius: 3,
                }}
              />
              
              {/* Play overlay (only visible when video not playing) */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  bgcolor: '#ca0019',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: isPlaying ? 0 : 0.9,
                  transition: 'opacity 0.2s ease',
                  pointerEvents: 'none',
                }}
              >
                <PlayCircleOutlineIcon sx={{ fontSize: 40, color: '#fff' }} />
              </Box>
            </Box>

            {/* Inspirational Quote Section */}
            <Paper
              elevation={0}
              sx={{
                p: 4,
                maxWidth: 820,
                width: '100%',
                background: 'linear-gradient(135deg, #faf7f7 0%, #ffffff 100%)',
                borderRadius: 3,
                border: '1px solid rgba(202, 0, 25, 0.1)',
                position: 'relative',
                mt: 2,
              }}
            >
              {/* Quote icon */}
              <FormatQuoteIcon 
                sx={{ 
                  position: 'absolute',
                  top: 10,
                  left: 15,
                  fontSize: 60,
                  color: 'rgba(202, 0, 25, 0.1)',
                  transform: 'rotate(180deg)',
                }} 
              />
              
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    textAlign: 'center',
                    fontWeight: 500,
                    color: '#2a2a2a',
                    lineHeight: 1.7,
                    fontSize: { xs: '1rem', md: '1.2rem' },
                    fontStyle: 'italic',
                    px: { xs: 2, md: 4 },
                  }}
                >
                  "Let {student.name.split(' ')[0]} remind you that consistent effort, guided mentorship, 
                  and a bold vision can turn potential into lasting success."
                </Typography>
                
                {/* Student name/signature line */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: 1.5,
                  mt: 2 
                }}>
                  <Box sx={{ 
                    width: 40, 
                    height: '2px', 
                    background: 'linear-gradient(90deg, transparent, #ca0019, transparent)',
                  }} />
                  <Typography variant="caption" sx={{ color: '#ca0019', fontWeight: 600 }}>
                    — {student.name}
                  </Typography>
                  <Box sx={{ 
                    width: 40, 
                    height: '2px', 
                    background: 'linear-gradient(90deg, transparent, #ca0019, transparent)',
                  }} />
                </Box>
              </Box>
            </Paper>

            {/* Video metadata/info */}
            <Box sx={{ 
              display: 'flex', 
              gap: 3, 
              flexWrap: 'wrap', 
              justifyContent: 'center',
              color: '#666',
              fontSize: '0.875rem'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#ca0019' }} />
                <Typography variant="caption">Exclusive Interview</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#ca0019' }} />
                <Typography variant="caption">Personal Journey</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#ca0019' }} />
                <Typography variant="caption">Career Insights</Typography>
              </Box>
            </Box>
          </Box>
        </Fade>
      ) : (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: 'center',
            bgcolor: '#faf7f7',
            borderRadius: 3,
            border: '1px dashed rgba(202, 0, 25, 0.3)',
          }}
        >
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              bgcolor: 'rgba(202, 0, 25, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <PlayCircleOutlineIcon sx={{ fontSize: 30, color: '#ca0019' }} />
          </Box>
          <Typography variant="h6" sx={{ color: '#2a2a2a', mb: 1, fontWeight: 600 }}>
            Video Message Coming Soon
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
            {student.name.split(' ')[0]} is preparing an exclusive video message. 
            Check back soon for inspiring insights!
          </Typography>
        </Paper>
      )}
    </Box>
  </Paper>
  );
};

export default VideoMessage;
