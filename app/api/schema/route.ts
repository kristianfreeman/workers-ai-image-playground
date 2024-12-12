import type { NextRequest } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import Cloudflare from "cloudflare";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const model = request.nextUrl.searchParams.get("model");
  if (!model) return new Response("Model not specified", { status: 400 });

  const env = getRequestContext().env;
  const { CLOUDFLARE_ACCOUNT_ID: account_id, CLOUDFLARE_API_TOKEN } = env;

  if (!account_id) return new Response("Account ID not specified", { status: 400 });
  if (!CLOUDFLARE_API_TOKEN) return new Response("API token not specified", { status: 400 });

  try {
    const client = new Cloudflare({
      apiToken: CLOUDFLARE_API_TOKEN,
    });

    const schema = await client.workers.ai.models.schema.get({
      account_id,
      model,
    });

    // Compatibility check mechanism
    const isCompatible = checkModelCompatibility(schema);
    if (!isCompatible) {
      return new Response("Model is not compatible", { status: 400 });
    }

    return new Response(JSON.stringify(schema), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  }
}

// Function to check model compatibility
function checkModelCompatibility(schema: any): boolean {
  // Define the standard schema for model inputs and outputs
  const standardSchema = {
    input: {
      properties: {
        message: { type: "string" },
        prompt: { type: "string" },
      },
      required: ["message", "prompt"],
    },
    output: {
      properties: {
        message: { type: "string" },
        image: { type: "string" },
      },
      required: ["message", "image"],
    },
  };

  // Check if the model schema matches the standard schema
  const inputProperties = schema.input.properties;
  const outputProperties = schema.output.properties;

  const isInputCompatible = Object.keys(standardSchema.input.properties).every(
    (key) => inputProperties[key] && inputProperties[key].type === standardSchema.input.properties[key].type
  );

  const isOutputCompatible = Object.keys(standardSchema.output.properties).every(
    (key) => outputProperties[key] && outputProperties[key].type === standardSchema.output.properties[key].type
  );

  return isInputCompatible && isOutputCompatible;
}
