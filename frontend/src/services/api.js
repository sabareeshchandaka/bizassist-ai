
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const apiRequest = async (
  endpoint,
  options = {},
  authenticated = false
) => {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (authenticated && typeof window !== "undefined") {
    const token = localStorage.getItem("bizassist_token");

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};

// Register a new business owner
export const registerUser = (userData) =>
  apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });

// Login
export const loginUser = (credentials) =>
  apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

// Get business profile
export const getBusinessProfile = () =>
  apiRequest("/business/profile", {
    method: "GET",
  }, true);

// Send a chat message
export const sendChatMessage = (message, conversationId) =>
  apiRequest("/chat/message", {
    method: "POST",
    body: JSON.stringify({
      message,
      ...(conversationId ? { conversationId } : {}),
    }),
  }, true);

// Retrieve conversation history
export const getChatHistory = () =>
  apiRequest("/chat/history", {
    method: "GET",
  }, true);


export const uploadDocument = async (file) => {
  const token = localStorage.getItem("bizassist_token");

  const formData = new FormData();
  formData.append("document", file);

  const response = await fetch(
    `${API_URL}/documents/upload`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Document upload failed");
  }

  return data;
};

export const getDocuments = () =>
  apiRequest(
    "/documents",
    { method: "GET" },
    true
  );

export const deleteDocument = (documentId) =>
  apiRequest(
    `/documents/${documentId}`,
    { method: "DELETE" },
    true
  );

export const createConversation = () =>
  apiRequest(
    "/chat/conversations",
    { method: "POST" },
    true
  );

export const getConversations = () =>
  apiRequest(
    "/chat/conversations",
    { method: "GET" },
    true
  );

export const getConversation = (conversationId) =>
  apiRequest(
    `/chat/conversations/${conversationId}`,
    { method: "GET" },
    true
  );

export const renameConversation = (conversationId, title) =>
  apiRequest(
    `/chat/conversations/${conversationId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ title }),
    },
    true
  );

export const deleteConversation = (conversationId) =>
  apiRequest(
    `/chat/conversations/${conversationId}`,
    { method: "DELETE" },
    true
  );


export const getWidgetConfig = () =>
  apiRequest(
    "/widget/config",
    { method: "GET" },
    true
  );

export const updateWidgetConfig = (configData) =>
  apiRequest(
    "/widget/config",
    {
      method: "PUT",
      body: JSON.stringify(configData),
    },
    true
  );

