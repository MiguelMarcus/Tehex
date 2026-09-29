(function () {
  "use strict";

  function roundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  function draw(ctx, { state, worldToPixel }) {
    (state.texts || []).forEach((item, index) => {
      if (!item.text || !Array.isArray(item.point)) return;
      const point = worldToPixel(item.point);
      const size = Math.max(14, Math.min(56, Number(item.size) || 26)) * state.scale;
      ctx.save();
      ctx.font = "700 italic " + size + "px " + (item.font || "Georgia, serif");
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const width = ctx.measureText(item.text).width + size * 1.05;
      const height = size * 1.45;
      if (item.background !== false) {
        ctx.fillStyle = item.backgroundColor || "#fff4d6";
        ctx.strokeStyle = item.borderColor || "#6f572f";
        ctx.lineWidth = Math.max(1, state.scale);
        if (item.shape === "pill") {
          roundedRect(ctx, point.x - width / 2, point.y - height / 2, width, height, height / 2);
        } else if (item.shape === "rectangle") {
          ctx.beginPath();
          ctx.rect(point.x - width / 2, point.y - height / 2, width, height);
        } else {
          ctx.beginPath();
          const skew = size * .28;
          ctx.moveTo(point.x - width / 2 + skew, point.y - height / 2);
          ctx.lineTo(point.x + width / 2, point.y - height / 2);
          ctx.lineTo(point.x + width / 2 - skew, point.y + height / 2);
          ctx.lineTo(point.x - width / 2, point.y + height / 2);
          ctx.closePath();
        }
        ctx.fill();
        ctx.stroke();
      }
      ctx.fillStyle = item.color || "#287a45";
      ctx.fillText(item.text, point.x, point.y);
      if (state.tool === "text" && state.selectedTextIndex === index) {
        ctx.setLineDash([5, 4]);
        ctx.strokeStyle = "#1f6e69";
        ctx.lineWidth = 1.5 * state.scale;
        ctx.strokeRect(point.x - width / 2 - 5, point.y - height / 2 - 5, width + 10, height + 10);
      }
      ctx.restore();
    });
  }

  window.MapTextRenderer = Object.freeze({ draw });
})();
