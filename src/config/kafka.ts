import { Kafka, Consumer, KafkaConfig } from 'kafkajs';
import { getEnvironmentVariables } from './environment';

export function createKafkaClient(): Kafka {
    const env = getEnvironmentVariables();

    const kafkaConfig: KafkaConfig = {
        clientId: env.KAFKA_CLIENT_ID,
        brokers: env.KAFKA_BROKER.split(','),
        ssl: env.KAFKA_SSL === 'true',
        sasl: env.KAFKA_SASL === 'true' ? {
            mechanism: 'plain',
            username: env.KAFKA_USERNAME || '',
            password: env.KAFKA_PASSWORD || ''
        } : undefined
    };

    return new Kafka(kafkaConfig)
}
