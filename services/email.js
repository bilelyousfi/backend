import nodemailer from "nodemailer";

const message = `
Welcome to home-service\n\n\n
 Thank you for joining us.
\nThank you again for choosing home-service.`;
 

const sendEmail =async (option)=>{
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
           user: "bilelyousfi101@gmail.com",
           pass: "xboqnybtwnjcxury"
           
        }
     });
     
     const mailOptions = {
        from: "home-service",
        to: option.email,
        subject: option.subject,
        text: option.text
     };
     
     await transporter.sendMail(mailOptions)
}


export default sendEmail;