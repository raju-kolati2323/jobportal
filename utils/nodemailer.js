import nodemailer from "nodemailer";

export  const sendMail = async ( to, subject, text,html) => {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_ID,
      pass: process.env.EMAIL_PASS,
    },
  });


  let mailOptions = {
    from: process.env.EMAIL_ID,
    to: to,
    subject: subject,
    text: text,
    html:html,
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.log(error);
  }
};


