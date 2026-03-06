import nodemailer from "nodemailer";

export const sendEmail = async (options: any) => {
  try{
    const transporter = nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    // auth: {
    //   user: process.env.HOST_EMAIL,
    //   pass: process.env.EMAIL_PASS
    // }
    port: 2525,
    auth: {
      user: "b69630151e682e",
      pass: "1efd6efe826eb1"
    }
  })

  //defining email option and structure

  const mailOptions = {
    from: `"{HOST Name}" <{HOST Email} >`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };
  await transporter.sendMail(mailOptions);
  } catch (error: any) {
    console.error("EMAIL ERROR:", error);
    throw new Error("Error sending verification email");
  }
};
