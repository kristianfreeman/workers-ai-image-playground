"use client";

import React, { useState, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Download } from "lucide-react"

export default function SimpleImageGenerator() {
  const selectedModel = "@cf/black-forest-labs/flux-1-schnell"
  const [prompt, setPrompt] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await fetch("/api/generate_image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: selectedModel, prompt }),
      })
      setGeneratedImage(await response.text())
    } catch (error) {
      console.error("Error generating image:", error)
    } finally {
      setIsLoading(false)
    }
  }, [selectedModel, prompt])

  const handleDownload = useCallback(() => {
    if (generatedImage) {
      const link = document.createElement('a')
      link.href = generatedImage
      link.download = 'generated-image.png'
      link.click()
    }
  }, [generatedImage])

  return (
    <div className="min-h-screen block md:flex">
      <div className="w-full md:w-1/2 block md:flex flex-col md:h-screen">
        <div className="p-4 bg-white space-y-2">
          <h1 className="text-2xl font-bold">Workers AI Image Generator</h1>
          <h2 className="text-lg mb-8">
            Powered by <a href="https://developers.cloudflare.com/workers-ai" className="text-blue-500 hover:underline">Cloudflare Workers AI</a>.
            Source code available on <a href="https://github.com/kristianfreeman/workers-ai-image-playground" className="text-blue-500 hover:underline">GitHub</a>.
          </h2>
        </div>
        <div className="flex-grow overflow-auto p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
                Prompt
              </label>
              <Input
                id="prompt"
                type="text"
                placeholder="Enter a prompt"
                value={prompt || ''}
                onChange={(e) => setPrompt(e.target.value)}
                required
              />
            </div>
          </form>
        </div>
        <div className="p-4 bg-white">
          <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
            Generate Image
          </Button>
        </div>
      </div>
      <div className="w-full md:w-1/2 block md:flex flex-col items-center justify-center p-4 bg-gray-50">
        {isLoading ? (
          <Loader2 className="h-16 w-16 animate-spin" />
        ) : generatedImage ? (
          <>
            <img src={generatedImage} alt="Generated" className="w-full h-auto rounded-lg shadow-lg mb-4" />
            <Button onClick={handleDownload} className="mt-4">
              <Download className="mr-2 h-4 w-4" /> Download Image
            </Button>
          </>
        ) : (
          <div className="text-center text-gray-500">Your generated image will appear here</div>
        )}
      </div>
    </div>
  )
}
