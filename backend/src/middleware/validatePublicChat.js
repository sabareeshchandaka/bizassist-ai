
const validatePublicChat = (req, res, next) => {
  const { widgetId, visitorId, messages } = req.body || {};

  const validWidgetId =
    typeof widgetId === "string" &&
    /^[a-f0-9]{32}$/i.test(widgetId);

  const validVisitorId =
    typeof visitorId === "string" &&
    /^[a-f0-9-]{36}$/i.test(visitorId);

  if (!validWidgetId) {
    return res.status(400).json({
      success: false,
      message: "Invalid widget ID.",
    });
  }

  if (!validVisitorId) {
    return res.status(400).json({
      success: false,
      message: "Invalid visitor session.",
    });
  }

  if (
    !Array.isArray(messages) ||
    messages.length === 0 ||
    messages.length > 12
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid conversation messages.",
    });
  }

  const validMessages = messages.every(
    (message) =>
      message &&
      typeof message === "object" &&
      ["user", "assistant"].includes(message.role) &&
      typeof message.content === "string" &&
      message.content.trim().length > 0 &&
      message.content.length <= 2000
  );

  if (!validMessages) {
    return res.status(400).json({
      success: false,
      message: "One or more messages are invalid.",
    });
  }

  const latestMessage = messages[messages.length - 1];

  if (latestMessage.role !== "user") {
    return res.status(400).json({
      success: false,
      message: "The latest message must be from the visitor.",
    });
  }

  // Only the latest visitor message is needed by the controller.
  req.publicChat = {
    widgetId,
    visitorId,
    latestMessage: latestMessage.content.trim(),
  };

  return next();
};

export default validatePublicChat;
