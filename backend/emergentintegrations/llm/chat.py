"""LLM chat used by /api/ai/chat.

Prefer Groq (legacy HiddenStay), then OpenAI, then a short local demo reply.
"""

from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Any, AsyncIterator, List, Optional


@dataclass
class UserMessage:
    text: str


@dataclass
class TextDelta:
    content: str


@dataclass
class StreamDone:
    pass


class LlmChat:
    def __init__(self, api_key: Optional[str] = None, session_id: str = "", system_message: str = ""):
        self.api_key = api_key
        self.session_id = session_id
        self.system_message = system_message
        self.provider = "groq"
        self.model = os.environ.get("GROQ_MODEL") or "llama-3.3-70b-versatile"

    def with_model(self, provider: str, model: str) -> "LlmChat":
        self.provider = provider
        self.model = model
        return self

    def _resolve_client(self):
        from openai import AsyncOpenAI

        groq_key = (self.api_key if self.provider == "groq" else None) or os.environ.get("GROQ_API_KEY")
        openai_key = os.environ.get("OPENAI_API_KEY")
        emergent = os.environ.get("EMERGENT_LLM_KEY")

        if groq_key and groq_key.strip():
            return (
                AsyncOpenAI(api_key=groq_key.strip(), base_url="https://api.groq.com/openai/v1"),
                os.environ.get("GROQ_MODEL") or self.model or "llama-3.3-70b-versatile",
                "groq",
            )

        if openai_key and openai_key.strip() and not openai_key.startswith("sk_test"):
            return (
                AsyncOpenAI(api_key=openai_key.strip()),
                "gpt-4o-mini" if self.provider != "openai" else (self.model or "gpt-4o-mini"),
                "openai",
            )

        if emergent and emergent.strip() and emergent.startswith("sk-"):
            return AsyncOpenAI(api_key=emergent.strip()), "gpt-4o-mini", "emergent"

        return None, None, None

    async def stream_message(
        self,
        message: UserMessage,
        history: Optional[List[dict]] = None,
    ) -> AsyncIterator[Any]:
        """Stream a reply. `history` is prior turns: [{role: user|assistant, content}]."""
        try:
            client, model, provider = self._resolve_client()
            if client and model:
                messages = [{"role": "system", "content": self.system_message}]
                for turn in history or []:
                    role = turn.get("role")
                    content = (turn.get("content") or "").strip()
                    if role in ("user", "assistant") and content:
                        messages.append({"role": role, "content": content})
                messages.append({"role": "user", "content": message.text})

                stream = await client.chat.completions.create(
                    model=model,
                    messages=messages,
                    stream=True,
                    temperature=0.7,
                    max_tokens=1800,
                )
                async for chunk in stream:
                    delta = chunk.choices[0].delta.content if chunk.choices else None
                    if delta:
                        yield TextDelta(content=delta)
                yield StreamDone()
                return
        except Exception as e:
            yield TextDelta(content=f"(AI error: {e})\n\n")
            yield StreamDone()
            return

        demo = (
            "Here's a simple 3-day Chiang Mai sketch:\n"
            "Day 1 — Old City temples + night bazaar.\n"
            "Day 2 — Doi Suthep morning, cafe hop in Nimman.\n"
            "Day 3 — Sticky Waterfall or cooking class.\n"
            "Add GROQ_API_KEY to backend/.env to enable live AI."
        )
        for word in demo.split(" "):
            yield TextDelta(content=word + " ")
        yield StreamDone()
