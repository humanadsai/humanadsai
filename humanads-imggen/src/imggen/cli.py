"""CLI entry point for humanads-imggen."""

import json
import sys
from pathlib import Path

import click
from rich.console import Console
from rich.table import Table

from . import __version__
from .config import get_openai_key, OUTPUT_DIR
from .template_engine import TemplateEngine
from .blacklist import BlacklistChecker
from .generators.openai_gpt import OpenAIGptImageGenerator
from .scoring import AiSmellScorer
from .storage.db import ImageDB

console = Console()


@click.group()
@click.version_option(version=__version__)
def main():
    """humanads-imggen — Anti-AI editorial thumbnail generator."""
    pass


# ── generate ──


@main.command()
@click.option("--theme", "-t", required=True, help="Theme/topic for the image")
@click.option(
    "--type",
    "slide_type",
    type=click.Choice(["hook", "chapter_title", "emphasis", "body", "cta"]),
    default="hook",
    help="Slide type (affects composition)",
)
@click.option("--count", "-n", default=1, help="Number of images to generate")
@click.option("--size", default="1024x1536", help="Image size")
@click.option("--quality", default="low", type=click.Choice(["low", "medium", "high"]))
@click.option("--score/--no-score", default=True, help="Auto-score after generation")
@click.option("--output-dir", default=None, help="Output directory")
def generate(
    theme: str,
    slide_type: str,
    count: int,
    size: str,
    quality: str,
    score: bool,
    output_dir: str | None,
):
    """Generate editorial-style thumbnail images."""
    api_key = get_openai_key()
    out = Path(output_dir) if output_dir else OUTPUT_DIR / _slugify(theme)
    out.mkdir(parents=True, exist_ok=True)

    engine = TemplateEngine()
    generator = OpenAIGptImageGenerator(api_key=api_key, output_dir=str(out))
    db = ImageDB()
    scorer = AiSmellScorer() if score else None

    category = engine.infer_category(theme)
    console.print(f"[bold]Theme:[/bold] {theme}")
    console.print(f"[bold]Category:[/bold] {category}")
    console.print(f"[bold]Slide type:[/bold] {slide_type}")
    console.print(f"[bold]Count:[/bold] {count}")
    console.print()

    total_cost = 0.0
    results = []

    for i in range(count):
        # Render prompt with slight variation
        variation_text = f"{theme} (variation {i + 1})" if count > 1 else theme
        prompt = engine.render(variation_text, slide_type)

        console.print(f"[dim]Generating {i + 1}/{count}...[/dim]")

        try:
            result = generator.generate(prompt, size=size, quality=quality)
            gen_id = db.save(
                result,
                theme=theme,
                slide_type=slide_type,
                category=category,
                template_name="editorial-anti-ai-v1",
                template_version="1.0.0",
            )
            total_cost += result.cost_usd

            # Auto-score
            score_report = None
            if scorer:
                score_report = scorer.score(result.image_path)
                db.update_score(gen_id, score_report.total_score, score_report.passed, score_report.detail)

            results.append((gen_id, result, score_report))

            status = "✅" if not score_report or score_report.passed else "❌"
            score_str = f" (AI臭: {score_report.total_score}/100)" if score_report else ""
            console.print(f"  {status} {result.image_path}{score_str}")

            # Save prompt alongside image
            prompt_path = Path(result.image_path).with_suffix(".prompt.txt")
            prompt_path.write_text(prompt)

            # Save metadata
            meta_path = Path(result.image_path).with_suffix(".meta.json")
            meta_path.write_text(json.dumps({
                "generation_id": gen_id,
                "template": "editorial-anti-ai-v1",
                "template_version": "1.0.0",
                "model": result.model,
                "size": result.size,
                "quality": result.quality,
                "cost_usd": result.cost_usd,
                "theme": theme,
                "slide_type": slide_type,
                "category": category,
                "ai_smell_score": score_report.total_score if score_report else None,
                "ai_smell_passed": score_report.passed if score_report else None,
                "prompt": prompt,
            }, indent=2, ensure_ascii=False))

        except Exception as e:
            console.print(f"  [red]Error: {e}[/red]")

    console.print()
    console.print(f"[bold]Total cost:[/bold] ${total_cost:.3f}")
    console.print(f"[bold]Output:[/bold] {out}")


# ── score ──


@main.command()
@click.argument("image_path", type=click.Path(exists=True))
def score(image_path: str):
    """Score an image for AI-generated aesthetics (AI臭スコア)."""
    scorer = AiSmellScorer()
    report = scorer.score(image_path)

    console.print()
    console.print(report.summary())
    console.print()

    if report.detail:
        console.print("[dim]Detail:[/dim]")
        console.print(json.dumps(report.detail, indent=2))


# ── validate ──


@main.command()
@click.option("--prompt", "-p", default=None, help="Prompt text to validate")
@click.option("--file", "-f", "file_path", default=None, help="Read prompt from file")
def validate(prompt: str | None, file_path: str | None):
    """Check a prompt against the AI-smell blacklist."""
    if file_path:
        prompt = Path(file_path).read_text()
    if not prompt:
        console.print("[red]Provide --prompt or --file[/red]")
        sys.exit(1)

    checker = BlacklistChecker()
    violations = checker.check(prompt)

    if violations:
        console.print(f"[red]Found {len(violations)} blacklisted word(s):[/red]")
        for v in violations:
            console.print(f"  ❌ {v}")
        console.print()
        cleaned = checker.sanitize(prompt)
        console.print("[bold]Sanitized prompt:[/bold]")
        console.print(cleaned)
    else:
        console.print("[green]✅ No blacklisted words found.[/green]")


# ── list ──


@main.command("list")
@click.option("--theme", default=None, help="Filter by theme")
@click.option("--limit", "-n", default=20, help="Max results")
def list_cmd(theme: str | None, limit: int):
    """List recent image generations."""
    db = ImageDB()
    rows = db.list_recent(limit=limit, theme=theme)

    if not rows:
        console.print("[dim]No generations found.[/dim]")
        return

    table = Table(title="Recent Generations")
    table.add_column("ID", style="dim")
    table.add_column("Theme")
    table.add_column("Type")
    table.add_column("AI臭", justify="right")
    table.add_column("Status")
    table.add_column("Cost", justify="right")
    table.add_column("Created")

    for r in rows:
        score_str = str(r["ai_smell_score"]) if r["ai_smell_score"] is not None else "-"
        status = r["status"] or "generated"
        cost_str = f"${r['cost_usd']:.3f}" if r["cost_usd"] else "-"
        table.add_row(
            r["id"][:20],
            r["theme"] or "-",
            r["slide_type"] or "-",
            score_str,
            status,
            cost_str,
            (r["created_at"] or "")[:19],
        )

    console.print(table)

    stats = db.stats()
    if stats.get("total"):
        console.print(
            f"\n[dim]Total: {stats['total']} | "
            f"Cost: ${stats.get('total_cost', 0):.3f} | "
            f"Avg AI臭: {stats.get('avg_score', 0):.0f} | "
            f"Pass: {stats.get('passed', 0)} | "
            f"Reject: {stats.get('rejected', 0)}[/dim]"
        )


# ── batch ──


@main.command()
@click.option("--theme", "-t", required=True, help="Theme for the batch")
@click.option("--variations", "-v", default=6, help="Number of variations")
@click.option("--output-dir", default=None, help="Output directory")
def batch(theme: str, variations: int, output_dir: str | None):
    """Generate multiple variations from a single theme."""
    api_key = get_openai_key()
    out = Path(output_dir) if output_dir else OUTPUT_DIR / _slugify(theme)
    out.mkdir(parents=True, exist_ok=True)

    engine = TemplateEngine()
    generator = OpenAIGptImageGenerator(api_key=api_key, output_dir=str(out))
    db = ImageDB()
    scorer = AiSmellScorer()

    slide_types = ["hook", "emphasis", "chapter_title"]
    cameras_cycle = engine.config.get("cameras", [""])

    console.print(f"[bold]Batch: {theme}[/bold]")
    console.print(f"[bold]Variations: {variations}[/bold]")
    console.print()

    total_cost = 0.0
    passed = 0
    rejected = 0

    for i in range(variations):
        st = slide_types[i % len(slide_types)]
        cam = cameras_cycle[i % len(cameras_cycle)]

        prompt = engine.render(
            f"{theme} — angle {i + 1}",
            slide_type=st,
            overrides={"camera": cam},
        )

        console.print(f"[dim]{i + 1}/{variations} ({st}, {cam[:20]}...)[/dim]")

        try:
            result = generator.generate(prompt)
            gen_id = db.save(result, theme=theme, slide_type=st, category=engine.infer_category(theme))
            total_cost += result.cost_usd

            report = scorer.score(result.image_path)
            db.update_score(gen_id, report.total_score, report.passed, report.detail)

            status = "✅" if report.passed else "❌"
            if report.passed:
                passed += 1
            else:
                rejected += 1
            console.print(f"  {status} AI臭: {report.total_score}/100 → {result.image_path}")

            # Save metadata
            Path(result.image_path).with_suffix(".prompt.txt").write_text(prompt)

        except Exception as e:
            console.print(f"  [red]Error: {e}[/red]")

    console.print()
    console.print(f"[bold]Results:[/bold] {passed} passed, {rejected} rejected")
    console.print(f"[bold]Total cost:[/bold] ${total_cost:.3f}")
    console.print(f"[bold]Output:[/bold] {out}")


# ── prompt (preview) ──


@main.command()
@click.option("--theme", "-t", required=True, help="Theme text")
@click.option(
    "--type",
    "slide_type",
    type=click.Choice(["hook", "chapter_title", "emphasis", "body"]),
    default="hook",
)
def prompt(theme: str, slide_type: str):
    """Preview the generated prompt without calling the API."""
    engine = TemplateEngine()
    category = engine.infer_category(theme)
    rendered = engine.render(theme, slide_type)

    console.print(f"[bold]Category:[/bold] {category}")
    console.print(f"[bold]Slide type:[/bold] {slide_type}")
    console.print()
    console.print("[bold]Prompt:[/bold]")
    console.print(rendered)
    console.print()
    console.print(f"[dim]Length: {len(rendered)} chars[/dim]")


# ── helpers ──


def _slugify(text: str) -> str:
    """Create a filesystem-safe slug from text."""
    import re
    slug = re.sub(r"[^\w\s-]", "", text.lower())
    slug = re.sub(r"[\s_]+", "-", slug)
    return slug[:50].strip("-")


if __name__ == "__main__":
    main()
