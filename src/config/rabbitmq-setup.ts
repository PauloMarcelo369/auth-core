import client, { Channel, ChannelModel } from "amqplib";

export class SetupRabbitMQ {
  private connection: ChannelModel;
  private channel: Channel;
  private queue: string = "emails";
  constructor() {
    this.init();
  }

  async init() {
    await this.getConnection();
    await this.createChannel();
    await this.channel.assertQueue(this.queue);
  }

  private async getConnection() {
    this.connection = await client.connect(
      `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASS}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`,
    );
  }

  private async createChannel() {
    this.channel = await this.connection.createChannel();
  }

  public sendMessage(payload: any) {
    const message = JSON.stringify(payload);
    this.channel.sendToQueue(this.queue, Buffer.from(message));
  }
}
