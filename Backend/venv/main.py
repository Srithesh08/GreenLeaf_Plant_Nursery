
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import mysql.connector

app = FastAPI()

app.mount(
    "/images",
    StaticFiles(directory="../Frontend/Images"),
    name="images"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

class Plant(BaseModel):
    name: str
    price: float
    category: str
    image: str

db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="YOUR_MYSQL_PASSWORD",
    database="greenleaf_db"
)

cursor = db.cursor(dictionary=True)

@app.get("/")
def home():
    return {"message": "Welcome to GreenLeaf Plant Nursery!"}

@app.get("/about")
def about():
    return {"message": "GreenLeaf is an online plant nursery."}

@app.get("/plants")
def get_plants():
    cursor.execute("SELECT * FROM plants")
    plants = cursor.fetchall()
    return plants

@app.get("/plants/{plant_id}")
def get_plant_by_id(plant_id: int):
    cursor.execute(
        "SELECT * FROM plants WHERE id = %s",
        (plant_id,)
    )

    plant = cursor.fetchone()

    if plant is None:
        raise HTTPException(status_code=404, detail="Plant not found")

    return plant

@app.post("/plants")
def add_plant(plant: Plant):
    query = """
        INSERT INTO plants (name, price, category, image)
        VALUES (%s, %s, %s, %s)
    """

    values = (
        plant.name,
        plant.price,
        plant.category,
        plant.image
    )

    cursor.execute(query, values)
    db.commit()

    return {
        "message": "Plant added successfully",
        "plant_id": cursor.lastrowid
    }

@app.put("/plants/{plant_id}")
def update_plant(plant_id: int, plant: Plant):
    cursor.execute(
        "SELECT * FROM plants WHERE id = %s",
        (plant_id,)
    )

    existing_plant = cursor.fetchone()

    if existing_plant is None:
        raise HTTPException(status_code=404, detail="Plant not found")

    query = """
        UPDATE plants
        SET name = %s, price = %s, category = %s, image = %s
        WHERE id = %s
    """

    values = (
        plant.name,
        plant.price,
        plant.category,
        plant.image,
        plant_id
    )

    cursor.execute(query, values)
    db.commit()

    return {"message": "Plant updated successfully"}

@app.delete("/plants/{plant_id}")
def delete_plant(plant_id: int):
    cursor.execute(
        "SELECT * FROM plants WHERE id = %s",
        (plant_id,)
    )

    plant = cursor.fetchone()

    if plant is None:
        raise HTTPException(status_code=404, detail="Plant not found")

    cursor.execute(
        "DELETE FROM plants WHERE id = %s",
        (plant_id,)
    )

    db.commit()

    return {"message": "Plant deleted successfully"}
