import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChatBubble, Timestamp, TypingIndicator } from 'shadcn-ui';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    fetch("/api/models")
      .then((res) => res.json())
      .then((data) => setModels(data))
      .catch(console.error);
  }, []);

  const handleSend = async () => {
    if (input.trim() === '' || selectedModel === '') return;

    const newMessage = { sender: 'user', text: input, timestamp: new Date().toISOString() };
    setMessages([...messages, newMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, model: selectedModel }),
      });

      const data = await response.json();
      const aiMessage = { sender: 'ai', text: data.message, timestamp: new Date().toISOString() };
      setMessages([...messages, newMessage, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <ChatBubble key={index} sender={msg.sender}>
            {msg.text}
            <Timestamp>{new Date(msg.timestamp).toLocaleTimeString()}</Timestamp>
          </ChatBubble>
        ))}
        {isTyping && <TypingIndicator />}
      </div>
      <Form onSubmit={handleSend}>
        <FormItem>
          <FormLabel htmlFor="model">AI Model</FormLabel>
          <FormControl>
            <Select onValueChange={setSelectedModel} value={selectedModel}>
              <SelectTrigger id="model">
                <SelectValue placeholder="Select an AI model" />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.id}>{model.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
        <FormItem>
          <FormLabel htmlFor="message">Message</FormLabel>
          <FormControl>
            <Input
              id="message"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
            />
          </FormControl>
          <FormMessage />
        </FormItem>
        <Button type="submit">Send</Button>
      </Form>
    </div>
  );
};

export default Chat;
