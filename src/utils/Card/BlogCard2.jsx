import { ArrowOutward } from "@mui/icons-material";
import { Card, CardContent, CardMedia, Typography, Box } from "@mui/material";

export default function BlogCard2({ title, subtitle, imgSrc }) {
  return (
    <Card className="!bg-transparent !shadow-none text-white">
      <div className="flex items-center justify-between pt-4 pb-2">
        <div>
          <Typography variant="h6" className="!text-black">
            {title}
          </Typography>
          <Typography variant="body2" className="text-slate-700">
            {subtitle}
          </Typography>
        </div>
        <div className="bg-black hover:bg-[#ca0019] w-10 h-10 flex items-center justify-center rounded-full p-1">
          <ArrowOutward className="text-white" fontSize="small" />
        </div>
      </div>
      {imgSrc && (
        <CardMedia
          component="img"
          height="100"
          image={imgSrc}
          alt={title}
          sx={{ objectFit: 'cover' }}
        />
      )}
      
      <CardContent sx={{ flexGrow: 1, padding: '24px' }}>
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <div>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600,
                color: '#000',
                mb: 1
              }}
            >
              {title}
            </Typography>
            
            <Typography 
              variant="body2" 
              sx={{ color: 'text.secondary' }}
            >
              {subtitle}
            </Typography>
          </div>
          
          <Box 
            sx={{
              backgroundColor: '#CA0019',
              borderRadius: '50%',
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'scale(1.1)',
              }
            }}
          >
            <ArrowOutward fontSize="small" sx={{ color: 'white' }} />
          </Box>
        </div>
        
        <Box className="mt-4">
          <Typography variant="caption" className="text-gray-500">
            March 28, 2025
          </Typography>
          
          <Box 
            sx={{ 
              mt: 2, 
              display: 'flex',
              gap: 1
            }}
          >
            <span className="px-2 py-1 bg-gray-100 text-xs rounded-full">Design</span>
            <span className="px-2 py-1 bg-gray-100 text-xs rounded-full">Technology</span>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
