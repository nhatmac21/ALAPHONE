import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import EmailIcon from "@mui/icons-material/Email";

export default function Footer() {
  return (
    <Box component="footer" sx={{ background: '#101c1c', color: '#a3e635', py: 4, mt: 0 }}>
      <Box className="container mx-auto px-4" display="flex" flexDirection={{xs:'column',sm:'row'}} justifyContent="space-between" alignItems="center" gap={2}>
        <Stack direction="column" gap={1}>
          <Typography fontWeight={700} fontSize={22} color="#22c55e">Alaphone</Typography>
          <Typography fontSize={15} color="#a3e635">Số 1 về điện thoại chính hãng tại Việt Nam</Typography>
          <Typography fontSize={14} color="#a3e635">Hotline: <span style={{ color: '#fff' }}>Đang cập nhật...</span></Typography>
          <Typography fontSize={14} color="#a3e635">Email: <span style={{ color: '#fff' }}>Đang cập nhật...</span></Typography>
        </Stack>
        <Stack direction="row" gap={2} alignItems="center">
          <IconButton href="https://facebook.com" target="_blank" sx={{ color: '#22c55e' }}><FacebookIcon /></IconButton>
          <IconButton href="https://instagram.com" target="_blank" sx={{ color: '#22c55e' }}><InstagramIcon /></IconButton>
          <IconButton href="mailto:support@alaphone.vn" sx={{ color: '#22c55e' }}><EmailIcon /></IconButton>
        </Stack>
      </Box>
      <Typography align="center" color="#a3e635" fontSize={14} mt={3}>
        © {new Date().getFullYear()} Alaphone. All rights reserved.
      </Typography>
    </Box>
  );
} 