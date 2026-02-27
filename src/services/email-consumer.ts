import nodemailer from "nodemailer";
import amqp from "amqplib";

import dotenv from "dotenv";

dotenv.config();

const mail_queue = process.env.MAIL_QUEUE || "email_queue";
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;

export async function startEmailConsumer() {
  const connection = await amqp.connect(
    `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASS}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`,
  );
  const channel = await connection.createChannel();
  await channel.assertQueue(mail_queue);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });

  channel.consume(mail_queue, async (msg) => {
    if (msg) {
      const { to, subject, body } = JSON.parse(msg.content.toString());
      await transporter.sendMail({
        from: `Suporte ${user}`,
        to,
        subject,
        text: body,
      });
      channel.ack(msg);
      console.log(`📧 Email enviado para ${to}`);
    }
  });
}

startEmailConsumer();
