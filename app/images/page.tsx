'use client'

import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState } from 'react'

type R2Image = {
  key: string
  uploaded: string
}

const imageLoader = ({ src }: { src: string }) => {
  return `/api/image?key=${src}`;
}

export default function Images() {
  const [images, setImages] = useState<R2Image[]>([])

  useEffect(() => {
    const fetchImages = async () => {
      const currentUrl = new URL(window.location.href)
      const data = await fetch(`${currentUrl.origin}/api/images`)
      const imageData = await data.json<R2Image[]>()
      setImages(imageData)
      console.log(imageData)
    }

    fetchImages()
  }, [])

  return (
    <div className="min-h-screen block md:flex">
      <div className="w-full block md:flex flex-col md:h-screen">
        <div className="p-4 bg-white space-y-2">
          <h1 className="text-2xl font-bold">List Images</h1>
          <h2 className="text-lg mb-8">
            Powered by <a href="https://developers.cloudflare.com/workers-ai" className="text-blue-500 hover:underline">Cloudflare Workers AI</a>.
            Source code available on <a href="https://github.com/kristianfreeman/workers-ai-image-playground" className="text-blue-500 hover:underline">GitHub</a>.
          </h2>
        </div>

        <div className="p-4 flex flex-col gap-4">
          {!images || !images.length && <span>No images yet.</span>}

          <div className="grid grid-cols-3 gap-2 max-w-screen-lg">
            {images.map(image => (
              <div className="space-y-2" key={image.key}>
                <Image loader={imageLoader} src={image.key} width={256} height={256} alt={image.key} />
                <p className="text-sm truncate">
                  {image.key}
                </p>
              </div>
            ))}
          </div>

          <p>
            <Button asChild>
              <Link href="/">Back to Image Generator</Link>
            </Button>
          </p>
        </div>
      </div>
    </div>
  )
}
