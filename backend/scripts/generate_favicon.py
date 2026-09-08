import math
from PIL import Image, ImageDraw

def create_careerai_icon(size=256):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 1. Background Rounded Rectangle with Blue to Indigo gradient
    # We create a gradient mask
    scale = size / 256.0
    corner_radius = int(58 * scale)

    # Draw gradient
    for y in range(size):
        ratio = y / size
        # #2563EB (37, 99, 235) to #4F46E5 (79, 70, 229)
        r = int(37 + (79 - 37) * ratio)
        g = int(99 + (70 - 99) * ratio)
        b = int(235 + (229 - 235) * ratio)
        draw.line([(0, y), (size, y)], fill=(r, g, b, 255))

    # Mask to rounded rectangle
    mask = Image.new("L", (size, size), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle([0, 0, size - 1, size - 1], radius=corner_radius, fill=255)
    img.putalpha(mask)

    # 2. Draw Compass ring & needle on top
    overlay = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    ov_draw = ImageDraw.Draw(overlay)

    cx, cy = size / 2, size / 2
    r = 84 * scale
    ring_width = max(2, int(9 * scale))

    # Outer circle
    ov_draw.ellipse(
        [cx - r, cy - r, cx + r, cy + r],
        outline=(255, 255, 255, 235),
        width=ring_width,
    )

    # 4 cardinal small ticks
    tick_len = 10 * scale
    tick_width = max(2, int(4 * scale))
    # North
    ov_draw.line([(cx, cy - r), (cx, cy - r + tick_len)], fill=(255, 255, 255, 240), width=tick_width)
    # South
    ov_draw.line([(cx, cy + r - tick_len), (cx, cy + r)], fill=(255, 255, 255, 240), width=tick_width)
    # East
    ov_draw.line([(cx + r - tick_len, cy), (cx + r, cy)], fill=(255, 255, 255, 240), width=tick_width)
    # West
    ov_draw.line([(cx - r, cy), (cx - r + tick_len, cy)], fill=(255, 255, 255, 240), width=tick_width)

    # Compass 4-point dynamic needle rotated 45 deg (NE/SW)
    # Top-right tip (NE)
    ne_tip = (cx + 56 * scale, cy - 56 * scale)
    # Bottom-left tip (SW)
    sw_tip = (cx - 56 * scale, cy + 56 * scale)
    # Lateral corners
    corner_nw = (cx - 18 * scale, cy - 18 * scale)
    corner_se = (cx + 18 * scale, cy + 18 * scale)

    # North-East pointer half 1 (Pure White)
    ov_draw.polygon([ne_tip, corner_nw, (cx, cy)], fill=(255, 255, 255, 255))
    # North-East pointer half 2 (Light Cyan/Sky Blue)
    ov_draw.polygon([ne_tip, corner_se, (cx, cy)], fill=(147, 197, 253, 255))

    # South-West pointer half 1 (Light Silver)
    ov_draw.polygon([sw_tip, corner_nw, (cx, cy)], fill=(226, 232, 240, 240))
    # South-West pointer half 2 (Navy Accent)
    ov_draw.polygon([sw_tip, corner_se, (cx, cy)], fill=(59, 130, 246, 255))

    # Needle outline
    needle_pts = [ne_tip, corner_se, sw_tip, corner_nw]
    ov_draw.polygon(needle_pts, outline=(255, 255, 255, 255), width=max(1, int(2 * scale)))

    # Central pivot
    pivot_r = 11 * scale
    ov_draw.ellipse(
        [cx - pivot_r, cy - pivot_r, cx + pivot_r, cy + pivot_r],
        fill=(30, 58, 138, 255),
        outline=(255, 255, 255, 255),
        width=max(1, int(3 * scale)),
    )
    # Center white dot
    dot_r = 3.5 * scale
    ov_draw.ellipse(
        [cx - dot_r, cy - dot_r, cx + dot_r, cy + dot_r],
        fill=(255, 255, 255, 255),
    )

    final = Image.alpha_composite(img, overlay)
    return final

if __name__ == "__main__":
    icon_256 = create_careerai_icon(256)
    
    # Save high-res PNGs
    icon_256.save("c:/4-1/frontend/public/apple-icon.png", "PNG")
    icon_256.save("c:/4-1/frontend/src/app/icon.png", "PNG")
    icon_256.save("c:/4-1/frontend/public/icon.png", "PNG")

    # Generate multi-resolution favicon.ico (16, 32, 48, 64, 128, 256)
    sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    icon_256.save("c:/4-1/frontend/src/app/favicon.ico", format="ICO", sizes=sizes)
    icon_256.save("c:/4-1/frontend/public/favicon.ico", format="ICO", sizes=sizes)

    print("✅ Successfully generated CareerAI favicons and icon images!")
