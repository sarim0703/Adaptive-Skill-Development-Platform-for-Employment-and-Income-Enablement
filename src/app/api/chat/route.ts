import { getPhi4Model, PHI4_MENTOR_PROMPT } from "@/lib/ai/models";
import { buildMentorContext } from "@/lib/ai/build-mentor-context";
import { streamText } from "ai";
import { auth } from "@/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages, subtopicId, triggerType, timeSpentSeconds } = await req.json();

  // Build the live context block
  const contextBlock = await buildMentorContext(
    session.user.id,
    subtopicId ?? '',
    triggerType ?? null,
    timeSpentSeconds ?? 0
  );

  const systemPrompt = `${PHI4_MENTOR_PROMPT}\n\n${contextBlock}`;

  const model = getPhi4Model();

  const result = streamText({
    model,
    system: systemPrompt,
    messages,
  });

  return result.toTextStreamResponse();
}
