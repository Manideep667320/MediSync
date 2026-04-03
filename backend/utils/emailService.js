const nodemailer = require('nodemailer');

// Define a transporter for sending emails via SMTP
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Send an email notification for order status updates.
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} templateName - Name of the notification type (e.g., 'READY_FOR_PICKUP')
 * @param {object} data - Dynamic data for the email template
 */
exports.sendNotificationEmail = async (to, subject, templateName, data) => {
  try {
    let htmlContent = '';
    
    // Simple template logic (can be expanded with HTML files/templates)
    if (templateName === 'READY_FOR_PICKUP') {
      htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; line-height: 1.6;">
          <h2 style="color: #10b981;">Medicine Ready for Pickup!</h2>
          <p>Hello <strong>${data.patientName}</strong>,</p>
          <p>Your prescription order <strong>${data.orderId}</strong> is fully packed and ready for pickup at:</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold;">${data.pharmacyName}</p>
            <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">${data.pharmacyAddress}</p>
          </div>
          <p>Please visit the pharmacy during business hours to collect your medicine.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="font-size: 12px; color: #999;">This is an automated notification from MediSync. Please do not reply to this email.</p>
        </div>
      `;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"MediSync Notifications" <noreply@medisync.com>',
      to,
      subject,
      html: htmlContent
    };

    // If credentials are not provided, log the email to console for development
    if (!process.env.EMAIL_USER || process.env.EMAIL_USER.includes('your-email')) {
      console.log('------------------------------');
      console.log('EMAIL SIMULATION (No credentials set in .env)');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Template: ${templateName}`);
      console.log('------------------------------');
      return { success: true, simulated: true };
    }

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending notification email:', error);
    return { success: false, error: error.message };
  }
};
