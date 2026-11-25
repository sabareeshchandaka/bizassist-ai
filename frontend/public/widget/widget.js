
(function () {
  "use strict";

  const script = document.currentScript;

  if (!script) return;

  const widgetId = script.getAttribute("data-widget-id");
// Unique ID for this visitor's current browser-page session.
const visitorId =
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        (character) => {
          const random = Math.random() * 16 | 0;
          const value =
            character === "x"
              ? random
              : (random & 0x3) | 0x8;

          return value.toString(16);
        }
      );
  const apiUrl = (
    script.getAttribute("data-api-url") ||
    "http://localhost:5000/api"
  ).replace(/\/+$/, "");

  if (!widgetId) {
    console.error("[BizAssist] Missing data-widget-id");
    return;
  }

  // Avoid installing the same widget twice.
  if (document.getElementById("bizassist-widget-host")) {
    return;
  }

  const host = document.createElement("div");
  host.id = "bizassist-widget-host";

  Object.assign(host.style, {
    position: "fixed",
    right: "24px",
    bottom: "24px",
    zIndex: "2147483647",
  });

  document.body.appendChild(host);

  // Shadow DOM prevents most website CSS from affecting the widget.
  const shadow = host.attachShadow({ mode: "open" });

  const style = document.createElement("style");

  style.textContent = `
    * {
      box-sizing: border-box;
      font-family: Arial, sans-serif;
    }

    .launcher {
      width: 60px;
      height: 60px;
      border: none;
      border-radius: 50%;
      background: var(--primary, #4F46E5);
      color: white;
      font-size: 27px;
      cursor: pointer;
      box-shadow: 0 5px 20px rgba(0,0,0,.2);
      float: right;
    }

    .panel {
      width: 350px;
      height: 480px;
      max-height: calc(100vh - 110px);
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 35px rgba(0,0,0,.2);
      overflow: hidden;
      display: none;
      flex-direction: column;
      margin-bottom: 14px;
    }

    .panel.open {
      display: flex;
    }

    .header {
      background: var(--primary, #4F46E5);
      color: white;
      padding: 17px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }

    .header-title {
      font-size: 16px;
      font-weight: 700;
    }

    .header-subtitle {
      font-size: 12px;
      margin-top: 5px;
      opacity: .85;
    }

    .close {
      border: none;
      background: transparent;
      color: white;
      font-size: 24px;
      cursor: pointer;
    }

    .messages {
      flex: 1;
      padding: 15px;
      overflow-y: auto;
      background: #f8fafc;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .message {
      max-width: 85%;
      padding: 11px 13px;
      border-radius: 13px;
      font-size: 13px;
      line-height: 1.5;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }

    .assistant {
      align-self: flex-start;
      background: #e2e8f0;
      color: #0f172a;
    }

    .user {
      align-self: flex-end;
      background: var(--primary, #4F46E5);
      color: white;
    }

    .typing {
      font-size: 12px;
      color: #64748b;
      padding: 0 15px 10px;
      background: #f8fafc;
      display: none;
    }

    .typing.visible {
      display: block;
    }

    .form {
      display: flex;
      gap: 8px;
      padding: 12px;
      border-top: 1px solid #e2e8f0;
      background: white;
    }

    .input {
      flex: 1;
      min-width: 0;
      border: 1px solid #cbd5e1;
      border-radius: 20px;
      padding: 11px 13px;
      font-size: 13px;
      outline: none;
    }

    .input:focus {
      border-color: var(--primary, #4F46E5);
    }

    .send {
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      background: var(--primary, #4F46E5);
      color: white;
      cursor: pointer;
      font-size: 17px;
    }

    .send:disabled {
      opacity: .5;
      cursor: not-allowed;
    }

    @media (max-width: 480px) {
      .panel {
        width: min(350px, calc(100vw - 32px));
        height: min(480px, calc(100vh - 110px));
      }
    }
  `;

  shadow.appendChild(style);

  const panel = document.createElement("div");
  panel.className = "panel";

  const header = document.createElement("div");
  header.className = "header";

  const headerContent = document.createElement("div");

  const title = document.createElement("div");
  title.className = "header-title";
  title.textContent = "AI Assistant";

  const subtitle = document.createElement("div");
  subtitle.className = "header-subtitle";
  subtitle.textContent = "Online · Powered by BizAssist";

  headerContent.append(title, subtitle);

  const closeButton = document.createElement("button");
  closeButton.className = "close";
  closeButton.type = "button";
  closeButton.textContent = "×";
  closeButton.setAttribute("aria-label", "Close chat");

  header.append(headerContent, closeButton);

  const messagesContainer = document.createElement("div");
  messagesContainer.className = "messages";

  const typing = document.createElement("div");
  typing.className = "typing";
  typing.textContent = "AI assistant is thinking...";

  const form = document.createElement("form");
  form.className = "form";

  const input = document.createElement("input");
  input.className = "input";
  input.type = "text";
  input.placeholder = "Type your message...";
  input.maxLength = 2000;
  input.autocomplete = "off";
  input.setAttribute("aria-label", "Message");

  const sendButton = document.createElement("button");
  sendButton.className = "send";
  sendButton.type = "submit";
  sendButton.textContent = "➤";
  sendButton.setAttribute("aria-label", "Send message");

  form.append(input, sendButton);

  panel.append(
    header,
    messagesContainer,
    typing,
    form
  );

  const launcher = document.createElement("button");
  launcher.className = "launcher";
  launcher.type = "button";
  launcher.textContent = "✦";
  launcher.setAttribute("aria-label", "Open AI chat");

  shadow.append(panel, launcher);

  let conversationMessages = [];
  let isLoading = false;
  let assistantName = "AI Assistant";
  let welcomeMessage = "Hello! How can I help you today?";
  let primaryColor = "#4F46E5";

  const addMessage = (role, content) => {
    const message = document.createElement("div");

    message.className =
      `message ${role === "user" ? "user" : "assistant"}`;

    // textContent prevents HTML/script injection.
    message.textContent = content;

    messagesContainer.appendChild(message);
    messagesContainer.scrollTop =
      messagesContainer.scrollHeight;
  };

  const showError = (message) => {
    addMessage("assistant", message);
  };

  const initialize = async () => {
    try {
      const response = await fetch(
        `${apiUrl}/public-chat/config/${widgetId}`
      );

      if (!response.ok) {
        throw new Error("Widget configuration unavailable");
      }

      const data = await response.json();

      assistantName = data.config.assistantName;
      welcomeMessage = data.config.welcomeMessage;
      primaryColor = data.config.primaryColor;

      host.style.setProperty("--primary", primaryColor);

      title.textContent = assistantName;

      conversationMessages = [
        {
          role: "assistant",
          content: welcomeMessage,
        },
      ];

      addMessage("assistant", welcomeMessage);
    } catch (error) {
      console.error("[BizAssist]", error.message);
      welcomeMessage = "Hello! How can I help you today?";
      conversationMessages = [
        {
          role: "assistant",
          content: welcomeMessage,
        },
      ];
      addMessage("assistant", welcomeMessage);
    }
  };

  const sendMessage = async (content) => {
    if (isLoading || !content.trim()) return;

    const message = content.trim();

    conversationMessages.push({
      role: "user",
      content: message,
    });

    addMessage("user", message);

    isLoading = true;
    sendButton.disabled = true;
    input.disabled = true;
    typing.classList.add("visible");

    try {
      const response = await fetch(
        `${apiUrl}/public-chat/message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            widgetId,
            visitorId,
            messages: conversationMessages.slice(-12),
          }),
        }
      );

      const data = await response.json();
      console.log("[BizAssist] API status:", response.status);
        console.log("[BizAssist] API response:", data);
      if (!response.ok) {
        throw new Error(
          data.message || "Unable to get a response"
        );
      }

      if (!data.reply || typeof data.reply !== "string") {
  throw new Error("The API returned an invalid AI response");
}

      conversationMessages.push({
        role: "assistant",
        content: data.reply,
      });

      addMessage("assistant", data.reply);
    } catch (error) {
      console.error("[BizAssist]", error);

      // Remove the failed user request from conversation history.
      conversationMessages.pop();

      showError(
        `Error: ${error.message || "Unable to connect to the assistant"}`
      );
    } finally {
      isLoading = false;
      sendButton.disabled = false;
      input.disabled = false;
      typing.classList.remove("visible");
      input.focus();
    }
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const message = input.value.trim();

    if (!message || isLoading) return;

    input.value = "";
    sendMessage(message);
  });

  launcher.addEventListener("click", () => {
    panel.classList.add("open");
    launcher.style.display = "none";
    input.focus();
  });

  closeButton.addEventListener("click", () => {
    panel.classList.remove("open");
    launcher.style.display = "block";
  });

  initialize();
})();
