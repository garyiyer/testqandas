import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { prompt, selectedChunks } = await req.json();

    if (!prompt || !selectedChunks || selectedChunks.length === 0) {
      return NextResponse.json({ error: 'Invalid input: prompt and selectedChunks are required' }, { status: 400 });
    }

    // Prepare context from selected chunks
    const context = selectedChunks.join('\n\n');

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key is not configured' }, { status: 500 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant that generates questions based on given context." },
        { role: "user", content: `Context:\n${context}\n\nUser Request: Generate 5 multiple choice questions based on the following prompt: ${prompt}\n\nPlease ensure you generate exactly 5 questions, each with 4 answer choices.` }
      ],
      max_tokens: 1000,  // Increased from 150 to 1000
      temperature: 0.7,  // Added temperature for some variability
    });

    const response = completion.choices[0].message.content;
    return NextResponse.json({ response });
  } catch (error: any) {
    console.error('Detailed error:', error);
    return NextResponse.json({ error: `An error occurred: ${error.message || 'Unknown error'}` }, { status: 500 });
  }
}
