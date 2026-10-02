export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("OK");
    }

    try {
      const update = await request.json();
      console.log("Telegram update:", JSON.stringify(update));

      const message = update.message;

      if (!message) {
        console.log("No message in update");
        return new Response("OK");
      }

      const result = await copyMessage(
        env.BOT_TOKEN,
        message.chat.id,
        message.message_id
      );

      console.log("Telegram copyMessage response:", JSON.stringify(result));

      if (!result.ok) {
        return new Response(JSON.stringify({
          ok: false,
          telegram_error: result
        }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }

      return new Response("OK");
    } catch (error) {
      console.log("Worker error:", error?.stack || String(error));

      return new Response(JSON.stringify({
        ok: false,
        error: String(error)
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
};

async function copyMessage(token, chatId, messageId) {
  const response = await fetch(
    `https://api.telegram.org/bot${token}/copyMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: chatId,
        from_chat_id: chatId,
        message_id: messageId
      })
    }
  );

  return response.json();
}
