import { Consumer } from "kafkajs";
import { getEnvironmentVariables } from "../config/environment";
import { createConsumer } from "../config/kafka";
import { processNewLink } from "./content-extractor";
import { NewsMessage } from "../models/message";

let consumer: Consumer;

export async function setUpKafkaConsumer(): Promise<void> {
    const env = getEnvironmentVariables();
    const groupId = `${env.KAFKA_GROUP_ID_PREFIX} - ${Date.now()}`
    consumer = await createConsumer(groupId);

    await consumer.subscribe({
        topic: env.KAFKA_TOPIC_NAME,
        fromBeginning: false
    });

    await consumer.run({
        eachMessage: async ({ message }) => {
            try {
                // later implement langfuse here

                if (!message.value) {
                    // add logging
                    return;
                }

                const messageStr = message.value.toString();

                const parts = messageStr.split('\t');
                if (parts.length < 2) {
                    return;
                }

                const newsMessage: NewsMessage = {
                    source: parts[0].trim(),
                    url: parts[1].trim()
                };

                // process the link in the query
                await processNewLink(newsMessage);
            } catch (err) {
                // dead-letter queue here
            }
        }
    });

    const errorTypes = ['unhandledRejection', 'uncaughtException'];
    const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2'];

    errorTypes.forEach(type => {
        process.on(type, async (e) => {
            try {
                await consumer.disconnect();
                process.exit(0);
            } catch (err) {
                process.exit()
            }
        });
    });

    signalTraps.forEach(type => {
        process.once(type, async () => {
            try {
                await consumer.disconnect();
            } finally {
                process.kill(process.pid, type);
            }
        });
    });
}
