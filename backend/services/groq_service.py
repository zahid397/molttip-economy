import groq
import logging
import asyncio
from typing import Optional, Dict, Any, List

from app.core.config import settings

logger = logging.getLogger(__name__)


class GroqService:
    def __init__(self):
        self.client = groq.Groq(api_key=settings.GROQ_API_KEY)

        self.available_models = [
            "llama3-70b-8192",
            "llama3-8b-8192",
            "mixtral-8x7b-32768",
            "gemma-7b-it"
        ]

        self.default_model = "llama3-70b-8192"

        self.system_prompt = (
            "You are a creative assistant for MoltTip Economy, "
            "a platform where AI agents share insights and receive tips. "
            "Create engaging, thoughtful content that sparks discussion. "
            "Keep it concise, insightful, and relevant to AI, web3, crypto, startups, and tech."
        )

    def _validate_model(self, model: str) -> str:
        """Ensure model is valid"""
        if model not in self.available_models:
            return self.default_model
        return model

    async def generate_content(
        self,
        prompt: str,
        model: str = "llama3-70b-8192",
        max_tokens: int = 500,
        temperature: float = 0.7
    ) -> Dict[str, Any]:
        """Generate content using Groq AI (Async Safe)"""

        try:
            if not settings.GROQ_API_KEY or settings.GROQ_API_KEY.strip() == "":
                return {
                    "success": False,
                    "error": "Groq API key not configured"
                }

            model = self._validate_model(model)

            # Groq SDK sync call, so run in thread
            completion = await asyncio.to_thread(
                self.client.chat.completions.create,
                model=model,
                messages=[
                    {"role": "system", "content": self.system_prompt},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=max_tokens,
                temperature=temperature,
                top_p=0.9,
                stream=False
            )

            if not completion or not completion.choices:
                return {
                    "success": False,
                    "error": "No response from Groq API"
                }

            content = completion.choices[0].message.content or ""

            return {
                "success": True,
                "content": content.strip(),
                "model": model,
                "tokens_used": completion.usage.total_tokens if completion.usage else 0
            }

        except Exception as e:
            logger.error(f"Groq content generation error: {e}")

            return {
                "success": False,
                "error": str(e)
            }

    async def generate_post_ideas(self, topic: str, count: int = 5) -> Dict[str, Any]:
        """Generate post ideas on a given topic"""

        prompt = (
            f"Generate {count} engaging post ideas about '{topic}' "
            "for an AI agent social feed platform. "
            "Each idea should be 1-2 sentences."
        )

        return await self.generate_content(prompt, max_tokens=300)

    async def enhance_post(self, post_content: str) -> Dict[str, Any]:
        """Enhance existing post content"""

        prompt = (
            "Rewrite and improve this post while keeping the same meaning. "
            "Make it more engaging and clear:\n\n"
            f"{post_content}"
        )

        return await self.generate_content(prompt, max_tokens=600)

    async def generate_tags(self, content: str) -> Dict[str, Any]:
        """Generate relevant hashtags"""

        prompt = (
            "Generate 5-10 relevant hashtags for this content. "
            "Return only hashtags separated by commas.\n\n"
            f"{content}"
        )

        result = await self.generate_content(prompt, max_tokens=100)

        if result.get("success"):
            tags = [
                tag.strip()
                for tag in result.get("content", "").split(",")
                if tag.strip()
            ]
            result["tags"] = tags

        return result


groq_service = GroqService()
