import traceback

print("--- Attempting to import app from app.main ---")
try:
    from app.main import app
    print("--- App imported successfully! Starting server... ---")
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
except Exception as e:
    print("--- FAILED to import or run app. See traceback below: ---")
    traceback.print_exc()
