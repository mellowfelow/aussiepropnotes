# Auth.md

**Site:** Aussie Prop Notes — Australian prop money ecommerce store (static catalog + enquiry forms).

## Agent Registration

No authentication or registration is required. All resources on this site are publicly accessible to humans and AI agents.

## Public Resources

| Resource | URL |
|---|---|
| Product catalog | https://DOMAIN.com/shop/ |
| Wholesale info | https://DOMAIN.com/wholesale/ |
| Blog / guides | https://DOMAIN.com/blog/ |
| FAQ | https://DOMAIN.com/faq/ |
| llms.txt | https://DOMAIN.com/llms.txt |
| API Catalog | https://DOMAIN.com/.well-known/api-catalog |
| Agent Skills | https://DOMAIN.com/.well-known/agent-skills/index.json |
| MCP Server Card | https://DOMAIN.com/.well-known/mcp/server-card.json |

```json
{
  "agent_auth": {
    "register_uri": null,
    "identity_types_supported": ["none"],
    "credential_types_supported": ["none"],
    "notes": "No authentication required. All resources are public."
  }
}
```

## Ordering

Orders are human-in-the-loop: agents may prepare an order summary, but a human completes checkout via the order form or WhatsApp. Minimum order $250 AUD. Payment by crypto (10% discount), bank transfer or PayID is confirmed with a human before dispatch.

## Legal note

All products are reduced-scale, clearly marked prop reproductions for film, photography, event and training use. Not legal tender.
