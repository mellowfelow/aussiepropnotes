(function () {
  if (typeof navigator === 'undefined' || !navigator.modelContext) return;

  navigator.modelContext.provideContext({
    tools: [
      {
        name: "browse_products",
        description: "Browse Aussie Prop Notes products by category (film-tv-props, photography-props, event-party-props, custom-prop-money, novelty-money)",
        inputSchema: {
          type: "object",
          properties: {
            category: { type: "string", description: "Product category slug to browse" }
          }
        },
        execute: async ({ category }) => {
          const url = category
            ? "https://DOMAIN.com/shop/" + category + "/"
            : "https://DOMAIN.com/shop/";
          window.location.href = url;
          return { url: url };
        }
      },
      {
        name: "order_via_whatsapp",
        description: "Initiate a WhatsApp order with Aussie Prop Notes. Minimum order $250 AUD. Crypto payments get 10% off.",
        inputSchema: {
          type: "object",
          properties: {
            message: { type: "string", description: "Pre-filled order message" }
          }
        },
        execute: async ({ message }) => {
          const url = message
            ? "https://wa.me/61400000000?text=" + encodeURIComponent(message)
            : "https://wa.me/61400000000";
          window.open(url, "_blank");
          return { url: url };
        }
      },
      {
        name: "get_wholesale_info",
        description: "Get wholesale trade pricing tiers (10-20% off) and bulk ordering info",
        inputSchema: { type: "object", properties: {} },
        execute: async () => {
          window.location.href = "https://DOMAIN.com/wholesale/";
          return { url: "https://DOMAIN.com/wholesale/" };
        }
      },
      {
        name: "contact",
        description: "Contact Aussie Prop Notes for product questions, custom prints or support",
        inputSchema: { type: "object", properties: {} },
        execute: async () => {
          window.location.href = "https://DOMAIN.com/contact/";
          return { url: "https://DOMAIN.com/contact/" };
        }
      }
    ]
  });
})();
