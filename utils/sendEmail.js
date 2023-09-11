const nodemailer = require("nodemailer");
const { mailStatus } = require("../Model/userModel");

const sendEmail  = async function sendMail(to,subject,message){
  try{
     var transporter = nodemailer.createTransport({
      host: "lin.ezveb.com",
      port: 465,
      secure: true,
        auth: {
          user: process.env.nodemailer_user,
          pass: process.env.nodemailer_pass
        }
      });
      
      var mailOptions = {
        from: process.env.nodemailer_user,
        to: to,
        subject: subject,
        text: message
      };
      
     const result = transporter.sendMail(mailOptions,async function(error, info){
        if (error) {
          const data = {
            email: to,
            status: "failure"
          }
          await mailStatus.create(data);
        } else {
          const data = {
            email: to,
            status: "success"
          }
          await mailStatus.create(data);
          return info
        }
      });
      return result
  }
  catch(err){
     console.log("err", err)
  }
}


module.exports = sendEmail

