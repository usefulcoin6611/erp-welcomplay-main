import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`[Email] Sent: ${info.messageId} to ${to}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[Email] Error sending:', error);
    return { success: false, error };
  }
}

// ─── Email Templates ──────────────────────────────────────────

export const emailTemplates = {
  activation: (name: string, url: string) => ({
    subject: 'Aktivasi Akun Welcomplay ERP',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #2563eb;">Selamat Datang di Welcomplay ERP!</h2>
        <p>Halo ${name},</p>
        <p>Terima kasih telah mendaftar. Silakan klik tombol di bawah ini untuk mengaktifkan akun Anda:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${url}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Aktifkan Akun Sekarang</a>
        </div>
        <p>Atau salin dan tempelkan link berikut ke browser Anda:</p>
        <p style="word-break: break-all; color: #666;">${url}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999;">Email ini dikirim secara otomatis oleh Welcomplay ERP System.</p>
      </div>
    `,
  }),

  paymentNotification: (name: string, orderId: string, amount: string, planName: string, instructionsUrl?: string) => ({
    subject: `Menunggu Pembayaran - Order #${orderId}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #2563eb;">Menunggu Pembayaran</h2>
        <p>Halo ${name},</p>
        <p>Satu langkah lagi untuk mengaktifkan paket <strong>${planName}</strong> Anda.</p>
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Order ID:</strong> ${orderId}</p>
          <p style="margin: 5px 0;"><strong>Total Tagihan:</strong> Rp ${amount}</p>
        </div>
        ${instructionsUrl ? `
        <div style="text-align: center; margin: 30px 0;">
          <a href="${instructionsUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Lihat Instruksi Pembayaran</a>
        </div>
        ` : ''}
        <p>Silakan selesaikan pembayaran agar paket Anda dapat segera diaktifkan.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999;">Welcomplay ERP System - Solusi Bisnis Terintegrasi.</p>
      </div>
    `,
  }),

  paymentSuccess: (name: string, orderId: string, planName: string, expiryDate: string) => ({
    subject: `Pembayaran Berhasil! - Order #${orderId}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #10b981;">Pembayaran Berhasil!</h2>
        <p>Halo ${name},</p>
        <p>Pembayaran untuk Order ID <strong>#${orderId}</strong> telah kami terima.</p>
        <p>Paket <strong>${planName}</strong> Anda telah diaktifkan dan dapat digunakan sekarang.</p>
        <div style="background-color: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Berlaku Hingga:</strong> ${expiryDate}</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/dashboard" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Buka Dashboard</a>
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999;">Terima kasih telah menggunakan Welcomplay ERP.</p>
      </div>
    `,
  }),

  forgetPassword: (name: string, url: string) => ({
    subject: 'Reset Password Welcomplay ERP',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #2563eb;">Permintaan Reset Password</h2>
        <p>Halo ${name},</p>
        <p>Kami menerima permintaan untuk melakukan reset password akun Anda. Silakan klik tombol di bawah ini untuk melanjutkan:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${url}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password Sekarang</a>
        </div>
        <p>Link ini akan kedaluwarsa dalam 1 jam. Jika Anda tidak merasa melakukan permintaan ini, silakan abaikan email ini.</p>
        <p>Atau salin dan tempelkan link berikut ke browser Anda:</p>
        <p style="word-break: break-all; color: #666;">${url}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999;">Welcomplay ERP System - Keamanan Akun Anda Prioritas Kami.</p>
      </div>
    `,
  }),

  passwordResetSuccess: (name: string) => ({
    subject: 'Password Berhasil Diubah - Welcomplay ERP',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #10b981;">Password Berhasil Diubah</h2>
        <p>Halo ${name},</p>
        <p>Email ini mengonfirmasi bahwa password akun Welcomplay ERP Anda telah berhasil diubah.</p>
        <p>Jika Anda tidak merasa melakukan perubahan ini, silakan hubungi tim support kami segera atau coba lakukan reset password kembali.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/login" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Masuk ke Akun</a>
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999;">Welcomplay ERP System - Keamanan Akun Terjamin.</p>
      </div>
    `,
  }),
};
