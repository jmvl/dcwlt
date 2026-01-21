#!/usr/bin/env python3
"""
Create PWA icons for Event Wallet.
Generates 192x192 and 512x512 PNG icons with gradient background.
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size, output_path):
    """Create a square icon with gradient background and 'E' logo."""
    # Create image with gradient background
    img = Image.new('RGB', (size, size), color='#13a4ec')
    draw = ImageDraw.Draw(img)

    # Create gradient effect (simple vertical gradient)
    for y in range(size):
        # Interpolate between #13a4ec (top) and #0d7db3 (bottom)
        factor = y / size
        r = int(0x13 * (1 - factor) + 0x0d * factor)
        g = int(0xa4 * (1 - factor) + 0x7d * factor)
        b = int(0xec * (1 - factor) + 0xb3 * factor)
        draw.line([(0, y), (size, y)], fill=f'#{r:02x}{g:02x}{b:02x}')

    # Draw 'E' logo in white
    # Use a large font size relative to icon
    font_size = size // 2
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
    except:
        font = ImageFont.load_default()

    # Get text bounding box
    text = "E"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    # Center the text
    x = (size - text_width) // 2
    y = (size - text_height) // 2

    # Draw text with shadow for better visibility
    draw.text((x + 2, y + 2), text, fill='#0a5a8c', font=font)
    draw.text((x, y), text, fill='white', font=font)

    # Save
    img.save(output_path, 'PNG')
    print(f"Created {output_path} ({size}x{size})")

def main():
    # Ensure public directory exists
    public_dir = os.path.join(os.path.dirname(__file__), 'public')
    os.makedirs(public_dir, exist_ok=True)

    # Create icons
    create_icon(192, os.path.join(public_dir, 'app-icon-192.png'))
    create_icon(512, os.path.join(public_dir, 'app-icon-512.png'))

    print("\nPWA icons created successfully!")

if __name__ == '__main__':
    main()
