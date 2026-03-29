from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()


class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[int, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, branch_id: int):
        await websocket.accept()
        self.active_connections.setdefault(branch_id, []).append(websocket)

    def disconnect(self, websocket: WebSocket, branch_id: int):
        connections = self.active_connections.get(branch_id, [])
        if websocket in connections:
            connections.remove(websocket)

    async def broadcast_to_branch(self, branch_id: int, message: dict):
        for connection in self.active_connections.get(branch_id, []):
            await connection.send_json(message)


manager = ConnectionManager()


@router.websocket("/ws/{branch_id}")
async def websocket_endpoint(websocket: WebSocket, branch_id: int):
    await manager.connect(websocket, branch_id)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, branch_id)
