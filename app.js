const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

// Middleware untuk mengurai JSON
app.use(express.json());
app.use(cors()); // Tambahkan middleware CORS

// URL API Foonté dan token akses
const FOONTE_API_URL = 'https://api.fonnte.com/send';
const ACCESS_TOKEN = 'hca9G41X1bvHM9P3cy4A'; // Ganti dengan token akses yang valid

// Fungsi untuk menghasilkan OTP acak
const generateRandomOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Menghasilkan 6 digit angka acak
};

// Menyimpan OTP sementara (sebaiknya gunakan database untuk produksi)
let otpStore = {};

// Endpoint untuk mengirim OTP
app.post('/api/v1/send-otp', async (req, res) => {
    const { target } = req.body;

    // Validasi input
    if (!target) {
        return res.status(400).json({
            status: 'error',
            message: 'Field target diperlukan.'
        });
    }

    // Generate OTP
    const otp = generateRandomOTP();
    const message = `OTP Anda adalah: ${otp}`; // Format pesan menggunakan template literal

    // Simpan OTP di dalam memori
    otpStore[target] = otp;

    try {
        // Mengirim permintaan ke API Foonté
        const response = await axios.get(FOONTE_API_URL, { 
            params: {
                target,
                message,
                token: ACCESS_TOKEN // Menggunakan token sebagai parameter
            },
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Mengembalikan respons ke klien
        res.json({
            status: 'success',
            message: 'OTP telah berhasil dikirim.',
            otp, // Anda bisa mengembalikan OTP ke klien jika perlu
            data: response.data
        });
    } catch (error) {
        // Menangani kesalahan
        res.status(500).json({
            status: 'error',
            message: 'Gagal mengirim OTP.',
            error: error.response?.data?.message || error.message
        });
    }
});

// Endpoint untuk memverifikasi OTP
app.post('/api/v1/verify-otp', (req, res) => {
    const { target, otp } = req.body;

    // Validasi input
    if (!target || !otp) {
        return res.status(400).json({
            status: 'error',
            message: 'Field target dan OTP diperlukan.'
        });
    }

    // Cek apakah OTP cocok
    if (otpStore[target] === otp) {
        delete otpStore[target]; // Hapus OTP setelah verifikasi
        return res.json({
            status: 'success',
            message: 'OTP berhasil diverifikasi.'
        });
    } else {
        return res.status(400).json({
            status: 'error',
            message: 'OTP tidak valid atau telah kedaluwarsa.'
        });
    }
});

// Payment processing endpoint
app.post('/api/v1/payment', (req, res) => {
    const { paymentMethod, amount } = req.body;

    // Simple validation
    if (!paymentMethod || !amount) {
        return res.status(400).json({
            status: 'error',
            message: 'Payment method and amount are required.'
        });
    }

    // Here you would integrate your payment logic with a payment provider
    // For demonstration purposes, we'll assume the payment is successful.

    res.json({
        status: 'success',
        message: 'Payment successful!',
        data: {
            paymentMethod,
            amount,
        }
    });
});

// Menjalankan server pada port yang ditentukan
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`); // Menggunakan template literal
});
