"use client";
import { useEffect, useState } from "react";
import { Box, Typography, Paper, Stack, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Chip, Snackbar } from "@mui/material";

export default function StaffReturnsPage() {
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [openReject, setOpenReject] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  useEffect(() => {
    fetch("/api/return/list")
      .then(res => res.json())
      .then(data => {
        if (data.success) setReturns(data.returns);
        else setError(data.message || "Không lấy được danh sách!");
      })
      .catch(() => setError("Lỗi kết nối server!"))
      .finally(() => setLoading(false));
  }, []);

  const handleAccept = async (ret: any) => {
    const res = await fetch("/api/return/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ returnID: ret.returnID, status: "accepted" }),
    });
    const data = await res.json();
    if (data.success) {
      setSnackbar({ open: true, message: "Đã chấp nhận yêu cầu trả hàng!" });
      setReturns(rs => rs.map(r => r.returnID === ret.returnID ? { ...r, status: "accepted", processedAt: new Date().toISOString() } : r));
    } else {
      setSnackbar({ open: true, message: data.message || "Lỗi!" });
    }
  };

  const handleReject = async () => {
    if (!selected) return;
    const res = await fetch("/api/return/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ returnID: selected.returnID, status: "rejected", reason: rejectReason }),
    });
    const data = await res.json();
    if (data.success) {
      setSnackbar({ open: true, message: "Đã từ chối yêu cầu trả hàng!" });
      setReturns(rs => rs.map(r => r.returnID === selected.returnID ? { ...r, status: "rejected", processedAt: rejectReason } : r));
      setOpenReject(false);
      setRejectReason("");
      setSelected(null);
    } else {
      setSnackbar({ open: true, message: data.message || "Lỗi!" });
    }
  };

  return (
    <Box maxWidth={900} mx="auto" mt={6} bgcolor="#18232e" p={4} borderRadius={3} boxShadow={6}>
      <Typography variant="h4" fontWeight={800} color="#a3e635" mb={4} align="center">Quản lý yêu cầu trả hàng</Typography>
      {loading ? (
        <Typography align="center" color="#fff">Đang tải...</Typography>
      ) : error ? (
        <Typography align="center" color="error">{error}</Typography>
      ) : returns.length === 0 ? (
        <Typography align="center" color="#fff">Không có yêu cầu trả hàng nào.</Typography>
      ) : (
        <Stack spacing={3}>
          {returns.map((ret: any) => (
            <Paper key={ret.returnID} sx={{ p: 3, borderRadius: 3, background: '#232b36', color: '#fff' }} elevation={4}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography fontWeight={700} color="#a3e635" fontSize={20}>Yêu cầu #{ret.returnID}</Typography>
                <Chip label={ret.status === "pending" ? "Chờ xử lý" : ret.status === "accepted" ? "Đã chấp nhận" : "Đã từ chối"} color={ret.status === "pending" ? "warning" : ret.status === "accepted" ? "success" : "error"} sx={{ fontWeight: 700, fontSize: 16 }} />
              </Stack>
              <Typography fontSize={15} color="#fff" mb={0.5}>Ngày gửi: <span style={{ color: '#a3e635', fontWeight: 600 }}>{ret.createdAt ? new Date(ret.createdAt).toLocaleString() : "-"}</span></Typography>
              <Typography fontSize={15} color="#fff" mb={0.5}>Khách hàng: <span style={{ color: '#a3e635', fontWeight: 600 }}>{ret.orders?.user?.fullName || ret.orders?.user?.userName || 'Ẩn danh'}</span></Typography>
              <Typography fontSize={15} color="#fff" mb={0.5}>Mã đơn: <span style={{ color: '#a3e635', fontWeight: 600 }}>#{ret.orderID}</span></Typography>
              <Typography fontSize={15} color="#fff" mb={0.5}>Lý do trả hàng: <span style={{ color: '#fff' }}>{ret.reason}</span></Typography>
              {ret.status === "rejected" && (
                <Typography fontSize={15} color="#ff5252" mb={0.5}>Lý do từ chối: <span style={{ color: '#fff' }}>{ret.processedAt}</span></Typography>
              )}
              {ret.status === "accepted" && (
                <Typography fontSize={15} color="#a3e635" mb={0.5}>Hướng dẫn: Vui lòng liên hệ khách để tới cửa hàng gần nhất hoặc gửi đơn vị vận chuyển đến cửa hàng để trả hàng.</Typography>
              )}
              <Stack direction="row" spacing={2} mt={2}>
                {ret.status === "pending" && (
                  <>
                    <Button variant="contained" color="success" onClick={() => handleAccept(ret)} sx={{ fontWeight: 700, borderRadius: 2 }}>Chấp nhận</Button>
                    <Button variant="outlined" color="error" onClick={() => { setSelected(ret); setOpenReject(true); }} sx={{ fontWeight: 700, borderRadius: 2 }}>Từ chối</Button>
                  </>
                )}
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
      {/* Popup từ chối */}
      <Dialog open={openReject} onClose={() => setOpenReject(false)}>
        <DialogTitle color="error.main" fontWeight={700}>Lý do từ chối trả hàng</DialogTitle>
        <DialogContent>
          <TextField
            label="Nhập lý do từ chối"
            multiline
            minRows={3}
            fullWidth
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReject(false)} color="primary">Hủy</Button>
          <Button onClick={handleReject} color="error" variant="contained">Từ chối</Button>
        </DialogActions>
      </Dialog>
      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      />
    </Box>
  );
} 