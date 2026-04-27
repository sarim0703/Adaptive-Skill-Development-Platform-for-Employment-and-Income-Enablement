import { getGPT5InstantModel, GPT5_MENTOR_PROMPT } from "@/lib/ai/models";
import { buildMentorContext } from "@/lib/ai/build-mentor-context";
import { streamText } from "ai";
import { auth } from "@/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages, subtopicId, triggerType, timeSpentSeconds } = await req.json();

  // Normalize messages: Ensure 'content' exists (Vercel AI SDK 6.x compatibility)
  const normalizedMessages = (messages as any[]).map(msg => ({
    role: msg.role,
    content: msg.content || msg.parts?.map((p: any) => p.text || '').join('') || '',
  }));

  // Build the live context block
  const contextBlock = await buildMentorContext(
    session.user.id,
    subtopicId ?? '',
    triggerType ?? null,
    timeSpentSeconds ?? 0
  );

  const systemPrompt = `${GPT5_MENTOR_PROMPT}\n\n${contextBlock}`;

  console.log("[Chat API] Normalized Messages:", JSON.stringify(normalizedMessages, null, 2));
  console.log("[Chat API] System Prompt Length:", systemPrompt.length);

  const model = getGPT5InstantModel();

  const result = streamText({
    model,
    system: systemPrompt,
    messages: normalizedMessages,
  });

  return result.toTextStreamResponse();
}
