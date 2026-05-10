import * as ampq from 'amqplib';
import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class RabbitMQService implements OnModuleInit {
  private channel: ampq.Channel;

  async onModuleInit() {
    const connection = await ampq.connect('amqp://localhost:5672');

    this.channel = await connection.createChannel();
  }

  async publish(queue: string, message: any) {
    await this.channel.assertQueue(queue);

    this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
  }

  async consume(queue: string, callback: (message: any) => Promise<void>) {
    await this.channel.assertQueue(queue);
    
    await this.channel.consume(queue, async (msg) => {
      if (!msg) return;

      const content = JSON.parse(msg.content.toString());

      try {
        await callback(content);

        this.channel.ack(msg);
      } catch (error) {
        console.error(`Job ${content.id} failed:`, error);

        this.channel.ack(msg);
      }
    });
  }
}
