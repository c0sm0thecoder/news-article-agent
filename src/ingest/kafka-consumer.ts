import { Consumer } from "kafkajs";
import { getEnvironmentVariables } from "../config/environment";
import { createConsumer } from "../config/kafka";
import { processNewLink } from "./content-extractor";
import { NewsMessage } from "../models/message";
import { logger } from "../utils/logger";

let consumer: Consumer;

export async function setUpKafkaConsumer(): Promise<void> {
    const env = getEnvironmentVariables();
    // Fix group ID format - remove space that could cause issues
    const groupId = `${env.KAFKA_GROUP_ID_PREFIX}-${Date.now()}`;
    
    try {
        consumer = await createConsumer(groupId);

        await consumer.subscribe({
            topic: env.KAFKA_TOPIC_NAME,
            fromBeginning: false
        });

        logger.info(`Kafka consumer subscribed to topic: ${env.KAFKA_TOPIC_NAME}`);

        await consumer.run({
            eachMessage: async ({ message }) => {
                try {
                    if (!message.value) {
                        logger.warn('Received empty Kafka message, skipping');
                        return;
                    }

                    const messageStr = message.value.toString();
                    logger.debug(`Received message: ${messageStr}`);

                    const parts = messageStr.split('\t');
                    if (parts.length < 2) {
                        logger.warn(`Invalid message format: ${messageStr}`);
                        return;
                    }

                    const newsMessage: NewsMessage = {
                        source: parts[0].trim(),
                        url: parts[1].trim()
                    };

                    logger.info(`Processing news from ${newsMessage.source}: ${newsMessage.url}`);
                    await processNewLink(newsMessage);
                    logger.info(`Successfully processed: ${newsMessage.url}`);
                } catch (err) {
                    logger.error(`Error processing Kafka message: ${err instanceof Error ? err.message : String(err)}`);
                    // Don't rethrow - we want to continue processing messages
                }
            },
            // Add autoCommit to ensure offsets are committed even if processing takes time
            autoCommit: true
        });

        logger.info('Kafka consumer is running');
    } catch (err) {
        logger.error(`Failed to set up Kafka consumer: ${err instanceof Error ? err.message : String(err)}`);
        throw err;
    }

    // Error handling
    const errorTypes = ['unhandledRejection', 'uncaughtException'];
    const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2'];

    errorTypes.forEach(type => {
        process.on(type, async (e) => {
            logger.error(`${type}: ${e instanceof Error ? e.message : String(e)}`);
            try {
                logger.info('Disconnecting consumer due to error');
                await consumer.disconnect();
                process.exit(0);
            } catch (err) {
                logger.error(`Error while disconnecting: ${err instanceof Error ? err.message : String(err)}`);
                process.exit(1);
            }
        });
    });

    signalTraps.forEach(type => {
        process.once(type, async () => {
            try {
                logger.info(`Received ${type}, shutting down consumer`);
                await consumer.disconnect();
            } finally {
                process.kill(process.pid, type);
            }
        });
    });
}
