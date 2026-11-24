
let plants = [];
let cart = [];
let selectedCategory = "All";

const container = document.getElementById("plant-container");
const searchInput = document.getElementById("search-input");
const addPlantForm = document.getElementById("add-plant-form");

async function loadPlants() {
    try {
        const response = await fetch("http://127.0.0.1:8000/plants");

        if (!response.ok) {
            throw new Error("Unable to load plants.");
        }

        plants = await response.json();
        displayPlants(plants);
    } catch (error) {
        console.log("Error loading plants:", error);
    }
}

function displayPlants(plantList) {
    container.innerHTML = "";

    if (plantList.length === 0) {
        container.innerHTML = "<p>No plants found.</p>";
        return;
    }

    plantList.forEach(function(plant) {
        const plantIndex = plants.indexOf(plant);

        container.innerHTML += `
            <div class="plant-card">
                <img src="http://127.0.0.1:8000/images/${plant.image}" alt="${plant.name}">
                <h3>${plant.name}</h3>
                <p>Price: ₹${plant.price}</p>
                <button onclick="addToCart(${plantIndex})">
                    Add to Cart
                </button>
            </div>
        `;
    });
}

function addToCart(index) {
    cart.push(plants[index]);
    displayCart();
}

function displayCart() {
    const cartItems = document.getElementById("cart-items");
    const cartCount = document.getElementById("cart-count");
    const cartTotal = document.getElementById("cart-total");

    let total = 0;
    let output = "";

    for (let i = 0; i < cart.length; i++) {
        output += `
            <p>
                ${cart[i].name} - ₹${cart[i].price}
                <button onclick="removeFromCart(${i})">
                    Remove
                </button>
            </p>
        `;

        total = total + cart[i].price;
    }

    if (cart.length === 0) {
        output = "<p>Your cart is empty.</p>";
    }

    cartItems.innerHTML = output;
    cartCount.innerHTML = cart.length;
    cartTotal.innerHTML = total;
}

function removeFromCart(index) {
    cart.splice(index, 1);
    displayCart();
}

function filterCategory(category) {
    selectedCategory = category;
    applyFilters();
}

function applyFilters() {
    const searchValue = searchInput.value.toLowerCase();

    let filteredPlants = plants.filter(function(plant) {
        const matchesSearch = plant.name.toLowerCase().includes(searchValue);

        const matchesCategory =
            selectedCategory === "All" ||
            plant.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    displayPlants(filteredPlants);
}

searchInput.addEventListener("input", applyFilters);

addPlantForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const newPlant = {
        name: document.getElementById("plant-name").value,
        price: parseFloat(document.getElementById("plant-price").value),
        category: document.getElementById("plant-category").value,
        image: document.getElementById("plant-image").value
    };

    try {
        const response = await fetch("http://127.0.0.1:8000/plants", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newPlant)
        });

        if (response.ok) {
            alert("Plant added successfully!");
            addPlantForm.reset();
            await loadPlants();
        } else {
            alert("Unable to add plant.");
        }
    } catch (error) {
        console.log("Error:", error);
    }
});

loadPlants();
displayCart();
