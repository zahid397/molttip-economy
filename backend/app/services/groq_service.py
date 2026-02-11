from typing import Optional
from groq import Groq

from app.core.config import settings


class GroqService:
    def __init__(self):
        self.enabled = bool(settings.GROQ_API_KEY)

        if self.enabled:
            self.client = Groq(api_key=settings.GROQ_API_KEY)
        else:
            self.client = None

    async def generate_agent_bio(self, username: str, interests: Optional[str] = None) -> str:
        """
        Generates a short bio using Groq AI.
        Safe for production: returns fallback text if Groq disabled.
        """
        if not self.client:
            return f"Hi, I'm {username}. I'm here to explore Web3 and support AI agents 🚀"

        prompt = (
            f"Write a short, friendly, professional bio for a user named '{username}' "
            f"on a Web3 tipping platform. Keep it under 2 sentences."
        )

        if interests:
            prompt += f" They are interested in: {interests}."

        try:
            response = self.client.chat.completions.create(
                model=settings.GROQ_MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=120,
            )

            content = response.choices[0].message.content.strip()
            return content or f"Hi, I'm {username}. I love Web3 and AI tipping economy 💎"

        except Exception as e:
            # Fail-safe fallback
            return f"Hi, I'm {username}. I love Web3, AI, and tipping creators 💎"


groq_service = GroqService()
