import asyncio
from fastapi import WebSocket

clients: list[WebSocket] = []

async def broadcast(data: str):
    for client in clients:
        try:
            await client.send_text(data)
        except Exception:
            pass
