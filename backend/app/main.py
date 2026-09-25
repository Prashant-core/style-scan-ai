from fastapi import FastAPI

app = FastAPI(title="LookLogic AI API")

@app.get("/")
def read_root():
    return {"status": "success", "message": "LookLogic AI Backend is running!"}