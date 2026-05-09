import * as ampq from 'amqplib';
import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class RabbitMQService implements OnModuleInit {
    private channel: ampq.Channel;

    async onModuleInit() {
        const connection = await ampq.connect('amqp://localhost:5672');

        this.channel = await connection.createChannel();

        await this.channel.assertQueue('jobs');
    }

    async publish(message: any) {
        this.channel.sendToQueue(
            'jobs',
            Buffer.from(JSON.stringify(message)),
        );
    }
}
