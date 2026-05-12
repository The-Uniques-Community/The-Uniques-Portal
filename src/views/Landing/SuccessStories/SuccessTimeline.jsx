import React from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button
} from '@mui/material';

const SuccessTimeline = ({ student, timelineMinWidth, SectionHeading }) => (
  <Box sx={{ position: 'relative', minHeight: '600px' }}>
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, md: 5 },
        mb: 4,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 3,
        background: 'linear-gradient(180deg, #ffffff 0%, #faf7f7 100%)',
        border: '1px solid #eee',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
        }
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(#f0d2d6 1px, transparent 1px)',
          backgroundSize: '18px 18px',
          opacity: 0.35,
          pointerEvents: 'none'
        }}
      />

      <Box sx={{ position: 'relative' }}>
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="overline"
            sx={{
              color: '#ca0019',
              fontWeight: 600,
              letterSpacing: '0.5px',
              fontSize: '0.875rem',
              mb: 1,
              display: 'block'
            }}
          >
            JOURNEY & ACHIEVEMENTS
          </Typography>
          <SectionHeading variant="h4" sx={{ fontWeight: 700 }}>
            Success Timeline
          </SectionHeading>
          <Typography variant="body1" sx={{ maxWidth: '720px', color: '#4a4a4a', mt: 1 }}>
            Follow {student.name.split(' ')[0]}'s journey through key milestones, from early learning
            to professional growth, and the achievements that shaped each step.
          </Typography>
        </Box>

        <Box
          sx={{
            mt: 6,
            position: 'relative',
            overflowX: 'auto',
            overflowY: 'visible',
            pb: 4,
            '&::-webkit-scrollbar': {
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: '10px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#ca0019',
              borderRadius: '10px',
              '&:hover': {
                background: '#a50014',
              }
            },
          }}
        >
          <Box
            sx={{
              position: 'relative',
              minWidth: `${timelineMinWidth}px`,
              height: '300px',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: '80px',
                left: 0,
                right: 0,
                height: '3px',
                background: 'linear-gradient(90deg, #f0d2d6 0%, #ca0019 50%, #f0d2d6 100%)',
                borderRadius: '2px',
              }}
            />

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                position: 'relative',
                gap: 3,
              }}
            >
              {student.timeline.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    flex: 1,
                    minWidth: '220px',
                    position: 'relative',
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '72px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      zIndex: 2,
                    }}
                  >
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        bgcolor: '#fff',
                        border: '3px solid #ca0019',
                        boxShadow: '0 0 0 4px rgba(202, 0, 25, 0.1)',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'scale(1.2)',
                          boxShadow: '0 0 0 6px rgba(202, 0, 25, 0.15)',
                        }
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        position: 'absolute',
                        top: -30,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontWeight: 700,
                        color: '#ca0019',
                        bgcolor: 'rgba(202, 0, 25, 0.05)',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: '20px',
                        border: '1px solid rgba(202, 0, 25, 0.1)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.year}
                    </Typography>
                  </Box>

                  <Paper
                    elevation={0}
                    sx={{
                      position: 'absolute',
                      top: 120,
                      left: 0,
                      right: 0,
                      p: 2.5,
                      borderRadius: 2,
                      border: '1px solid #e9e1e2',
                      backgroundColor: '#fff',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 15px 40px rgba(202, 0, 25, 0.12)',
                        borderColor: '#ca0019',
                      }
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        bgcolor: '#ca0019',
                        borderRadius: '2px 2px 0 0',
                      }}
                    />

                    <Box
                      sx={{
                        display: 'inline-block',
                        bgcolor: 'rgba(202, 0, 25, 0.05)',
                        borderRadius: '20px',
                        px: 1.5,
                        py: 0.5,
                        mb: 1.5,
                      }}
                    >
                      <Typography variant="caption" sx={{ color: '#ca0019', fontWeight: 600 }}>
                        {item.achievements.length} Milestones
                      </Typography>
                    </Box>

                    <Typography variant="h6" sx={{ mb: 2, color: '#111', fontSize: '1rem' }}>
                      Key Achievements
                    </Typography>

                    <List dense sx={{ p: 0 }}>
                      {item.achievements.map((achievement, idx) => (
                        <ListItem key={idx} sx={{ px: 0, py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 28 }}>
                            <Box
                              sx={{
                                width: 20,
                                height: 20,
                                borderRadius: '50%',
                                bgcolor: 'rgba(202, 0, 25, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#ca0019',
                                fontSize: '12px',
                                fontWeight: 'bold'
                              }}
                            >
                              {idx + 1}
                            </Box>
                          </ListItemIcon>
                          <ListItemText
                            primary={achievement}
                            primaryTypographyProps={{
                              variant: 'body2',
                              sx: { color: '#222' }
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Paper>

    <Paper
      elevation={0}
      sx={{
        p: { xs: 4, md: 5 },
        mt: 5,
        mb: 4,
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        backgroundSize: 'cover',
        color: 'white',
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.1)',
        transition: 'transform 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        }
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: '40%',
          background: 'linear-gradient(135deg, transparent 0%, rgba(202, 0, 25, 0.1) 100%)',
        }}
      />

      <Box sx={{ position: 'relative', zIndex: 1, maxWidth: '70%' }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontWeight: 700,
            fontSize: { xs: '1.75rem', md: '2.25rem' }
          }}
        >
          Follow in {student.name.split(' ')[0]}'s Footsteps
        </Typography>
        <Typography
          paragraph
          sx={{
            color: 'rgba(255,255,255,0.8)',
            fontSize: '1.1rem',
            lineHeight: 1.6,
            mb: 3
          }}
        >
          Join The Uniques Community today and embark on your journey to professional excellence.
          Our comprehensive programs, mentorship opportunities, and vibrant network await you.
        </Typography>
        <Button
          variant="contained"
          size="large"
          sx={{
            mt: 2,
            bgcolor: '#ca0019',
            px: 4,
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 600,
            borderRadius: '50px',
            textTransform: 'none',
            boxShadow: '0 10px 20px rgba(202, 0, 25, 0.3)',
            '&:hover': {
              bgcolor: '#a50014',
              transform: 'translateY(-2px)',
              boxShadow: '0 15px 25px rgba(202, 0, 25, 0.4)',
            }
          }}
        >
          Join The Community
        </Button>
      </Box>
    </Paper>
  </Box>
);

export default SuccessTimeline;
