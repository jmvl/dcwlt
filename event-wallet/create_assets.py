#!/usr/bin/env python3
"""Create minimal PNG icon files for Expo build."""

import struct
import zlib

def create_png(filename, width=1024, height=1024, color=(66, 133, 244, 255)):
    """Create a minimal valid PNG file with solid color."""

    # PNG signature
    sig = b'\x89PNG\r\n\x1a\n'

    # IHDR chunk
    ihdr_body = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    ihdr = create_chunk(b'IHDR', ihdr_body)

    # IDAT chunk - create a 1x1 pixel that browsers scale
    # Using filter type 0 (None)
    scanline = bytes([0]) + bytes(color)  # Filter byte + RGBA pixel

    # Create minimal deflate data for 1x1 image
    # For a true 1024x1024, we'd need more data, but this works for prebuild
    compressed = zlib.compress(scanline * (width * height))

    idat = create_chunk(b'IDAT', compressed)

    # IEND chunk
    iend = create_chunk(b'IEND', b'')

    with open(filename, 'wb') as f:
        f.write(sig + ihdr + idat + iend)

    print(f'Created {filename}')

def create_chunk(chunk_type, data):
    """Create a PNG chunk with CRC."""
    length = struct.pack('>I', len(data))
    crc = zlib.crc32(chunk_type + data) & 0xffffffff
    crc_bytes = struct.pack('>I', crc)
    return length + chunk_type + data + crc_bytes

if __name__ == '__main__':
    import os

    assets_dir = 'assets'
    os.makedirs(assets_dir, exist_ok=True)

    # Create required icon files
    create_png(os.path.join(assets_dir, 'icon.png'))
    create_png(os.path.join(assets_dir, 'favicon.png'))

    print('✅ Asset files created successfully!')
