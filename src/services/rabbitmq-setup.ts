import client, { Channel, ChannelModel } from "amqplib";

let channel: Channel;
const mail_queue = process.env.MAIL_QUEUE || "email_queue";

export async function connectRabbitMQ() {
  const connection = await client.connect(
    `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASS}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`,
  );
  channel = await connection.createChannel();
  await channel.assertQueue(mail_queue);
  console.log("🐇 RabbitMQ conectado");
}

export function publishEmail(message: object) {
  channel.sendToQueue(mail_queue, Buffer.from(JSON.stringify(message)));
}
