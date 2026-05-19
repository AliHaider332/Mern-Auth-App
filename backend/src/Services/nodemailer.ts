import nodemailer from 'nodemailer';
import ejs from 'ejs';
import path from 'path';
const Verify_TemplatePath = path.join(
  __dirname,
  '../templates/verifyEmail.ejs'
);
const OTP_TemplatePath = path.join(__dirname, '../templates/OTPEmail.ejs');
const Password_Reset_TemplatePath = path.join(
  __dirname,
  '../templates/resetPassword.ejs'
);
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (
  name: string,
  email: string,
  verifyLink: string
) => {


  const url = process.env.DEVELOPMENT_URL + '/verifyEmail/' + verifyLink;
  const html = await ejs.renderFile(Verify_TemplatePath, {
    name,
    verifyLink: url,
  });
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verify Your Email',
    html: html,
  };
  await transporter.sendMail(mailOptions);
};
export const sendOTP = async (name: string, email: string, OTP: number) => {
  const html = await ejs.renderFile(OTP_TemplatePath, { name, OTP });
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Confirm Your OTP',
    html: html,
  };
  await transporter.sendMail(mailOptions);
};

export const sendResetEmail = async (
  name: string,
  email: string,
  verifyLink: string
) => {
  const url = process.env.DEVELOPMENT_URL + '/reset-password/' + verifyLink;
  const html = await ejs.renderFile(Password_Reset_TemplatePath, {
    name,
    verifyLink: url,
  });
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Reset Password',
    html: html,
  };
  await transporter.sendMail(mailOptions);
};
