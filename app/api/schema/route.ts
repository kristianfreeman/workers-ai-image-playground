import type { NextRequest } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import Cloudflare from "cloudflare";
import { authenticate } from '@cloudflare/access';

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const model = request.nextUrl.searchParams.get("model");
  if (!model) {
    return new Response(JSON.stringify({
      error: "Model not specified",
      code: "MISSING_MODEL",
      description: "The 'model' query parameter is required."
    }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const env = getRequestContext().env;
  const { CLOUDFLARE_ACCOUNT_ID: account_id, CLOUDFLARE_API_TOKEN } = env;

  if (!account_id) {
    return new Response(JSON.stringify({
      error: "Account ID not specified",
      code: "MISSING_ACCOUNT_ID",
      description: "The 'CLOUDFLARE_ACCOUNT_ID' environment variable is required."
    }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  if (!CLOUDFLARE_API_TOKEN) {
    return new Response(JSON.stringify({
      error: "API token not specified",
      code: "MISSING_API_TOKEN",
      description: "The 'CLOUDFLARE_API_TOKEN' environment variable is required."
    }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    // Authenticate the request using Cloudflare Access
    const authResult = await authenticate(request);
    if (!authResult.authenticated) {
      return new Response(JSON.stringify({
        error: "Unauthorized",
        code: "UNAUTHORIZED",
        description: "You are not authorized to access this resource."
      }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

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
      return new Response(JSON.stringify({
        error: "Model is not compatible",
        code: "INCOMPATIBLE_MODEL",
        description: "The specified model is not compatible with the required schema."
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify(schema), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    console.error("Error processing request:", error);
    return new Response(JSON.stringify({
      error: "Internal Server Error",
      message: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
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
