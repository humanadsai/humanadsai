"""Abstract base class for image generators."""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field


@dataclass
class GenerationResult:
    """Result of a single image generation."""

    image_path: str
    prompt: str
    model: str
    size: str
    quality: str
    cost_usd: float
    metadata: dict = field(default_factory=dict)


class ImageGenerator(ABC):
    """Abstract interface for image generation backends."""

    @abstractmethod
    def generate(
        self,
        prompt: str,
        size: str = "1024x1536",
        quality: str = "low",
    ) -> GenerationResult:
        """Generate a single image from a prompt."""
        ...

    @abstractmethod
    def name(self) -> str:
        """Return the generator name."""
        ...
