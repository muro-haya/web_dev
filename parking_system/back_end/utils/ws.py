import json
from typing import List, Union
from fastapi import WebSocket

clients: list[WebSocket] = []

async def broadcast(message: Union[dict, list, str]):
    """
    Send a message to all connected clients.
    The message can be a dict, list, or string.
    """
    text = json.dumps(message) if isinstance(message, (dict, list)) else str(message)
    dead = []
    for ws in list(clients):
        try:
            await ws.send_text(text)
        except Exception:
            # Remove disconnected clients
            try:
                await ws.close()
            except:
                pass
            dead.append(ws)
    for d in dead:
        if d in clients:
            clients.remove(d)
