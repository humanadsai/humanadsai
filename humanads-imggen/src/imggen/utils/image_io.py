"""Image loading/saving helpers."""

from pathlib import Path

from PIL import Image


def load_image(path: str | Path) -> Image.Image:
    """Load an image from file path."""
    return Image.open(path).convert("RGB")


def get_image_info(path: str | Path) -> dict:
    """Get basic image information."""
    p = Path(path)
    if not p.exists():
        return {"error": f"File not found: {path}"}

    img = Image.open(p)
    return {
        "path": str(p.absolute()),
        "format": img.format,
        "size": f"{img.width}x{img.height}",
        "mode": img.mode,
        "file_size_kb": round(p.stat().st_size / 1024, 1),
    }
