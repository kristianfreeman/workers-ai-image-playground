export const runtime = 'edge';

export async function GET(_request: Request) {
  const models = [
    {
      name: "dreamshaper-8-lcm",
      id: "@cf/lykon/dreamshaper-8-lcm"
    },
    {
      name: "flux-1-schnell",
      id: "@cf/black-forest-labs/flux-1-schnell"
    },
    {
      name: "qwen1.5-0.5b-chat",
      id: "@cf/qwen/qwen1.5-0.5b-chat"
    },
    {
      name: "stable-diffusion-v1-5-img2img",
      id: "@cf/runwayml/stable-diffusion-v1-5-img2img"
    },
    {
      name: "stable-diffusion-v1-5-inpainting",
      id: "@cf/runwayml/stable-diffusion-v1-5-inpainting"
    },
    {
      name: "stable-diffusion-xl-base-1.0",
      id: "@cf/stabilityai/stable-diffusion-xl-base-1.0"
    },
    {
      name: "stable-diffusion-xl-lightning",
      id: "@cf/bytedance/stable-diffusion-xl-lightning"
    }
  ];

  return new Response(JSON.stringify(models), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
