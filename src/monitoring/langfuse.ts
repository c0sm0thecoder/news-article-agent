import Langfuse from "langfuse";
import { getEnvironmentVariables } from "../config/environment";

export let langfuse: Langfuse;

export function initLangfuse(): Langfuse {
    const env = getEnvironmentVariables();

    langfuse = new Langfuse({
        publicKey: env.LANGFUSE_PUBLIC_KEY,
        secretKey: env.LANGFUSE_SECRET_KEY,
        baseUrl: env.LANGFUSE_HOST,
    });

    return langfuse;
}