from fastapi import FastAPI
from api import Body
from agent import ESAgent

app = FastAPI()
es_agnet = ESAgent()


@app.post("/agent/query")
async def read_item(body: Body):
    result = es_agnet.agent_chain.invoke(input=body.message)
    return {"result": result}