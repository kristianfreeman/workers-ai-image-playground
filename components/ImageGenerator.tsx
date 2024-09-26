"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Download } from "lucide-react"

type Model = {
  id: string
  name: string
}

export default function SimpleImageGenerator() {
  const [models, setModels] = useState<Model[]>([])
  const [prompt, setPrompt] = useState("")
  const [selectedModel, setSelectedModel] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/models")
      .then((res) => res.json())
      .then((data: any) => setModels(data))
      .catch((error) => console.error("Error fetching models:", error))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await fetch("/api/generate_image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, model: selectedModel }),
      })
      const data = await response.text()
      setGeneratedImage(data)
    } catch (error) {
      console.error("Error generating image:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement('a')
      link.href = generatedImage
      link.download = 'generated-image.png'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className="min-h-screen flex p-4">
      <div className="w-1/2 pr-4 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Image Generator</h1>
        <h2 className="text-lg mb-8">Powered by <a href="https://developers.cloudflare.com/workers-ai" className="text-blue-500 hover:underline">Cloudflare Workers AI</a></h2>

        <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
              Image Description
            </label>
            <Input
              id="prompt"
              placeholder="Describe the image you want to generate"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700">
              AI Model
            </label>
            <Select onValueChange={setSelectedModel} value={selectedModel}>
              <SelectTrigger id="model">
                <SelectValue placeholder="Select an AI model" />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={isLoading || !prompt || !selectedModel}>
            Generate Image
          </Button>
        </form>
      </div>

      <div className="w-1/2 pl-4 flex flex-col items-center justify-center bg-gray-50">
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
          <div className="text-center text-gray-500">
            Your generated image will appear here
          </div>
        )}
      </div>
    </div>
  )
}
