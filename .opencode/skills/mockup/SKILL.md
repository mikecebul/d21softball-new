---
name: mockup
description: Generate UI mockup and concept images with qwen-image-3. Use ONLY when the user says mockup, mock up, imagine, render, or concept, or asks for AI-generated imagery to explore a design before implementing it.
---

# Mockup image generation

When triggered, generate concept imagery with the `generate-image-save` tool.

Rules:

- Always pass `model: "qwen/qwen-image-3"`. Do not substitute another model without asking.
- Sizes: portrait phone UI uses `size: "1024x1536"`. Landscape or hero art uses `size: "1536x1024"`.
- Files save automatically to `generated_images/`. Reference the saved file in the reply so the user can view it.
- Mockups are for approval first. Never implement the design in code until the user approves one.
- If the tool reports missing OpenRouter auth, stop and tell the user to add an `OPENROUTER_API_KEY` or reconnect OpenRouter. Do not silently switch models.

## Project brand context (D21 Softball)

- Colors: deep navy `#0F1F3D`, ember red CTA, paper cream `#FAF6EB`, gold `#D4A017` accents.
- Type: Oswald display, Barlow Condensed uppercase, Geist body.
- Vibe: "Fastpitch at the waterfront", Petoskey, Michigan. Athletic scoreboard editorial, premium minor-league feel.
- Current mobile menu items: Tournaments, Archives, Local Leagues, Hall of Fame, Visit, Umpires, Rules, plus a "Register a team" CTA and the address 101 M-66 N, Charlevoix, MI 49720.
