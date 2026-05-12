import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  Work as WorkIcon,
  School as SchoolIcon,
  EmojiEvents as AchievementIcon,
  Assignment as ProjectIcon,
  Code as CodeIcon,
  Group as LeadershipIcon
} from '@mui/icons-material';

const ProfileInformation = ({
  student,
  detailTabValue,
  onDetailTabChange,
  isMobile,
  StyledTabs,
  StyledTab,
  SectionHeading,
  DetailCard
}) => (
  <Grid container spacing={4}>
    <Grid item xs={12}>
      <DetailCard elevation={3}>
        <SectionHeading variant="h5">Journey Overview</SectionHeading>
        <Typography variant="body1" paragraph sx={{ mt: 3 }}>
          {student.summary}
        </Typography>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <WorkIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Current Role</Typography>
                </Box>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  {student.role} at {student.company}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <SchoolIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Education</Typography>
                </Box>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  {student.education?.degree || student.batch}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AchievementIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Key Achievement</Typography>
                </Box>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  {student.leadership?.achievements?.[0] || student.timeline.slice(-1)[0].achievements[0]}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DetailCard>
    </Grid>

    <Grid item xs={12}>
      <DetailCard elevation={3}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <StyledTabs
            value={detailTabValue}
            onChange={onDetailTabChange}
            variant={isMobile ? 'scrollable' : 'standard'}
            scrollButtons={isMobile ? 'auto' : false}
          >
            <StyledTab
              icon={<SchoolIcon />}
              iconPosition="start"
              label="Education"
            />
            <StyledTab
              icon={<WorkIcon />}
              iconPosition="start"
              label="Professional Experience"
            />
            <StyledTab
              icon={<ProjectIcon />}
              iconPosition="start"
              label="Notable Projects"
            />
          </StyledTabs>
        </Box>

        {detailTabValue === 0 && student.education && (
          <Box sx={{ pt: 3 }}>
            <Typography variant="h6">{student.education.institution}</Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {student.education.degree}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, display: 'flex', justifyContent: 'space-between' }}>
              <span>{student.education.duration}</span>
              <span>{student.education.location}</span>
            </Typography>
            {student.education.details && (
              <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                {student.education.details}
              </Typography>
            )}
          </Box>
        )}

        {detailTabValue === 1 && (
          <Box sx={{ pt: 3 }}>
            {student.experience && student.experience.length > 0 ? (
              student.experience.map((exp, index) => (
                <Box key={index} sx={{ mb: index < student.experience.length - 1 ? 4 : 0 }}>
                  <Typography variant="h6">{exp.company}</Typography>
                  <Typography variant="subtitle1" color="text.secondary">{exp.role}</Typography>
                  <Typography variant="body2" sx={{ mt: 1, display: 'flex', justifyContent: 'space-between' }}>
                    <span>{exp.duration}</span>
                    <span>{exp.location}</span>
                  </Typography>

                  {exp.responsibilities && (
                    <List dense sx={{ mt: 1 }}>
                      {exp.responsibilities.map((resp, idx) => (
                        <ListItem key={idx} sx={{ pl: 0 }}>
                          <ListItemIcon sx={{ minWidth: 28 }}>
                            <AchievementIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={resp} />
                        </ListItem>
                      ))}
                    </List>
                  )}

                  {index < student.experience.length - 1 && <Divider sx={{ my: 2 }} />}
                </Box>
              ))
            ) : (
              <Typography color="text.secondary">No professional experience listed.</Typography>
            )}
          </Box>
        )}

        {detailTabValue === 2 && (
          <Box sx={{ pt: 3 }}>
            {student.projects && student.projects.length > 0 ? (
              <Grid container spacing={3}>
                {student.projects.map((project, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant="h6">{project.name}</Typography>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                          {project.date} • {project.technologies}
                        </Typography>
                        <Typography variant="body2" paragraph>{project.description}</Typography>

                        <Typography variant="subtitle2" color="primary" gutterBottom>
                          Key Achievements:
                        </Typography>
                        <List dense>
                          {project.achievements.map((achievement, idx) => (
                            <ListItem key={idx} sx={{ pl: 0 }}>
                              <ListItemIcon sx={{ minWidth: 28 }}>
                                <AchievementIcon color="primary" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText primary={achievement} />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography color="text.secondary">No projects listed.</Typography>
            )}
          </Box>
        )}
      </DetailCard>
    </Grid>

    {student.skills && (
      <Grid item xs={12}>
        <DetailCard elevation={3}>
          <SectionHeading variant="h5">
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CodeIcon sx={{ mr: 1 }} />
              Technical Skills
            </Box>
          </SectionHeading>

          <Grid container spacing={3} sx={{ mt: 2 }}>
            {student.skills.languages && (
              <Grid item xs={12} md={4}>
                <Typography variant="h6" gutterBottom>Languages</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {student.skills.languages.map((lang, idx) => (
                    <Chip
                      key={idx}
                      label={lang}
                      sx={{
                        bgcolor: '#000',
                        color: '#fff',
                        borderColor: '#000'
                      }}
                      size="small"
                    />
                  ))}
                </Box>
              </Grid>
            )}

            {student.skills.technologies && (
              <Grid item xs={12} md={4}>
                <Typography variant="h6" gutterBottom>Technologies & Frameworks</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {student.skills.technologies.map((tech, idx) => (
                    <Chip
                      key={idx}
                      label={tech}
                      variant="outlined"
                      sx={{
                        color: '#000',
                        borderColor: '#ca0019'
                      }}
                      size="small"
                    />
                  ))}
                </Box>
              </Grid>
            )}

            {student.skills.tools && (
              <Grid item xs={12} md={4}>
                <Typography variant="h6" gutterBottom>Developer Tools</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {student.skills.tools.map((tool, idx) => (
                    <Chip
                      key={idx}
                      label={tool}
                      sx={{
                        bgcolor: '#ca0019',
                        color: '#fff'
                      }}
                      size="small"
                    />
                  ))}
                </Box>
              </Grid>
            )}
          </Grid>
        </DetailCard>
      </Grid>
    )}

    {student.leadership && (
      <Grid item xs={12}>
        <DetailCard elevation={3}>
          <SectionHeading variant="h5">
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LeadershipIcon sx={{ mr: 1 }} />
              Leadership & Extracurricular
            </Box>
          </SectionHeading>

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6">{student.leadership.organization}</Typography>
            <Typography variant="subtitle1" color="text.secondary">{student.leadership.role}</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>{student.leadership.duration}</Typography>

            <List dense sx={{ mt: 2 }}>
              {student.leadership.achievements.map((achievement, idx) => (
                <ListItem key={idx} sx={{ pl: 0 }}>
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <AchievementIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={achievement} />
                </ListItem>
              ))}
            </List>
          </Box>
        </DetailCard>
      </Grid>
    )}
  </Grid>
);

export default ProfileInformation;
