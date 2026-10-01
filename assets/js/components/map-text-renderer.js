(function () {
  "use strict";

  function roundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath(); ctx.moveTo(x + radius, y); ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius); ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height); ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius); ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y); ctx.closePath();
  }

  function canvas(width, height) {
    const element = document.createElement("canvas");
    element.width = Math.ceil(width); element.height = Math.ceil(height);
    return element;
  }

  function tint(mask, color) {
    const output = canvas(mask.width, mask.height), context = output.getContext("2d");
    context.drawImage(mask, 0, 0); context.globalCompositeOperation = "source-in";
    context.fillStyle = color; context.fillRect(0, 0, output.width, output.height);
    return output;
  }

  function maskFor(text, item, size) {
    const measure = canvas(1, 1).getContext("2d");
    measure.font = "700 italic " + size + "px " + (item.font || "Georgia, serif");
    const spacing = Number(item.letterSpacing) || 0, curvature = Number(item.curvature) || 0, glyphs = [...text];
    const widths = glyphs.map(char => measure.measureText(char).width);
    const textWidth = widths.reduce((sum, width) => sum + width, 0) + Math.max(0, glyphs.length - 1) * spacing;
    const textHeight = size * 1.6 + Math.abs(curvature) * .3, padding = 4;
    const mask = canvas(textWidth + padding * 2, textHeight + padding * 2), context = mask.getContext("2d");
    context.font = measure.font; context.textAlign = "left"; context.textBaseline = "middle"; context.fillStyle = "#ffffff";
    let cursor = padding;
    glyphs.forEach((char, index) => {
      const progress = textWidth ? (cursor + widths[index] / 2 - padding) / textWidth - .5 : 0;
      context.fillText(char, cursor, textHeight / 2 + padding + curvature * (progress * progress - .25));
      cursor += widths[index] + spacing;
    });
    return { mask, textWidth, textHeight };
  }

  function drawEffects(ctx, mask, x, y, item) {
    const outline = Math.max(0, Number(item.outline) || 0), glow = Math.max(0, Number(item.glow) || 0);
    if (glow) {
      ctx.save(); ctx.globalAlpha = .78; ctx.filter = "blur(" + glow + "px)";
      ctx.drawImage(tint(mask, item.glowColor || "#ffffff"), x, y); ctx.restore();
    }
    if (outline) {
      const outlineMask = tint(mask, item.outlineColor || "#fff9f0"), steps = Math.max(12, Math.ceil(outline * 10));
      for (let step = 0; step < steps; step++) {
        const angle = Math.PI * 2 * step / steps;
        ctx.drawImage(outlineMask, x + Math.cos(angle) * outline, y + Math.sin(angle) * outline);
      }
    }
    ctx.drawImage(tint(mask, item.color || "#287a45"), x, y);
  }

  function getBounds(item, state, worldToPixel) {
    const point = worldToPixel(item.point);
    const size = Math.max(6, Math.min(56, Number(item.size) || 26)) * state.scale;
    const { mask, textWidth, textHeight } = maskFor(item.text || "", item, size);
    const padding = (Number(item.outline) || 0) + (Number(item.glow) || 0) * .5;
    const width = textWidth + size * 1.05 + padding * 2;
    const height = textHeight + padding * 2;
    const left = item.align === "left" ? point.x : item.align === "right" ? point.x - width : point.x - width / 2;
    const spriteX = item.align === "left" ? point.x : item.align === "right" ? point.x - mask.width : point.x - mask.width / 2;
    return { point, size, mask, width, height, left, spriteX, spriteY: point.y - mask.height / 2 };
  }

  function draw(ctx, { state, worldToPixel }) {
    (state.texts || []).forEach((item, index) => {
      if (!item.text || !Array.isArray(item.point)) return;
      const { point, size, mask, width, height, left, spriteX, spriteY } = getBounds(item, state, worldToPixel);
      ctx.save();
      if (item.background !== false) {
        ctx.fillStyle = item.backgroundColor || "#fff4d6"; ctx.strokeStyle = item.borderColor || "#6f572f"; ctx.lineWidth = Math.max(1, state.scale);
        if (item.shape === "pill") roundedRect(ctx, left, point.y - height / 2, width, height, height / 2);
        else if (item.shape === "rectangle") { ctx.beginPath(); ctx.rect(left, point.y - height / 2, width, height); }
        else {
          const skew = size * .28; ctx.beginPath(); ctx.moveTo(left + skew, point.y - height / 2); ctx.lineTo(left + width, point.y - height / 2);
          ctx.lineTo(left + width - skew, point.y + height / 2); ctx.lineTo(left, point.y + height / 2); ctx.closePath();
        }
        ctx.fill(); ctx.stroke();
      }
      drawEffects(ctx, mask, spriteX, spriteY, item);
      if (!state.isExporting && state.tool === "text" && state.selectedTextIndex === index) {
        ctx.setLineDash([5, 4]); ctx.strokeStyle = "#1f6e69"; ctx.lineWidth = 1.5 * state.scale;
        ctx.strokeRect(left - 5, point.y - height / 2 - 5, width + 10, height + 10);
      }
      ctx.restore();
    });
  }

  window.MapTextRenderer = Object.freeze({ draw, getBounds });
})();
