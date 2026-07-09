export const MESSAGE_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"] as const;

export async function reportMessage(apiUrl: string, messageId: string, content: string) {
  const response = await fetch(`${apiUrl}/support/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Message report",
      email: "reports@connectlove.app",
      subject: "Reported chat message",
      message: `Reported message ID: ${messageId}\nContent: ${content}`,
    }),
  });
  if (!response.ok) throw new Error("Message report failed.");
  return response.json();
}
