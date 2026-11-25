
import WidgetConfig from "../models/WidgetConfig.js";

// Create a default configuration if this business
// does not have one yet.
const getOrCreateConfig = async (businessId) => {
  let config = await WidgetConfig.findOne({
    business: businessId,
  });

  if (!config) {
    config = await WidgetConfig.create({
      business: businessId,
    });
  }

  return config;
};

// GET /api/widget/config
export const getWidgetConfig = async (req, res) => {
  try {
    const config = await getOrCreateConfig(
      req.user.business
    );

    res.status(200).json({
      success: true,
      config,
    });
  } catch (error) {
    console.error("Get widget config error:", error.message);

    res.status(500).json({
      message: "Unable to load widget configuration",
    });
  }
};

// PUT /api/widget/config
export const updateWidgetConfig = async (req, res) => {
  try {
    const {
      assistantName,
      welcomeMessage,
      primaryColor,
      enabled,
      allowedDomains,
    } = req.body;

    const updates = {};

    if (assistantName !== undefined) {
      if (
        typeof assistantName !== "string" ||
        !assistantName.trim() ||
        assistantName.length > 60
      ) {
        return res.status(400).json({
          message: "Assistant name must be 1–60 characters",
        });
      }

      updates.assistantName = assistantName.trim();
    }

    if (welcomeMessage !== undefined) {
      if (
        typeof welcomeMessage !== "string" ||
        welcomeMessage.length > 300
      ) {
        return res.status(400).json({
          message: "Welcome message cannot exceed 300 characters",
        });
      }

      updates.welcomeMessage = welcomeMessage.trim();
    }

    if (primaryColor !== undefined) {
      if (
        typeof primaryColor !== "string" ||
        !/^#[0-9A-Fa-f]{6}$/.test(primaryColor)
      ) {
        return res.status(400).json({
          message: "Enter a valid hex color",
        });
      }

      updates.primaryColor = primaryColor;
    }

    if (enabled !== undefined) {
      if (typeof enabled !== "boolean") {
        return res.status(400).json({
          message: "Enabled must be true or false",
        });
      }

      updates.enabled = enabled;
    }

    if (allowedDomains !== undefined) {
      if (
        !Array.isArray(allowedDomains) ||
        allowedDomains.length > 20 ||
        !allowedDomains.every(
          (domain) =>
            typeof domain === "string" &&
            domain.length <= 255
        )
      ) {
        return res.status(400).json({
          message: "Invalid website domain list",
        });
      }

      try {
        updates.allowedDomains = [
          ...new Set(
            allowedDomains.map((domain) => {
              const value = domain.trim();

              if (!value) {
                throw new Error("Empty domain");
              }

              const parsed = new URL(
                value.includes("://")
                  ? value
                  : `https://${value}`
              );

              if (
                parsed.protocol !== "https:" &&
                parsed.protocol !== "http:"
              ) {
                throw new Error("Invalid protocol");
              }

              if (
                parsed.pathname !== "/" ||
                parsed.search ||
                parsed.hash ||
                parsed.username ||
                parsed.password
              ) {
                throw new Error("Enter only a domain");
              }

              return parsed.hostname.toLowerCase();
            })
          ),
        ];
      } catch {
        return res.status(400).json({
          message: "Enter valid domains without paths",
        });
      }
    }

    const config = await getOrCreateConfig(
      req.user.business
    );

    Object.assign(config, updates);

    await config.save();

    res.status(200).json({
      success: true,
      message: "Widget configuration updated",
      config,
    });
  } catch (error) {
    console.error("Update widget config error:", error.message);

    res.status(500).json({
      message: "Unable to update widget configuration",
    });
  }
};
