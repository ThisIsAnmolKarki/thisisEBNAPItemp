import json
import random
import json

import bcrypt
# import bcrypt


# Open and read data from the file
with open("/home/anmol/Downloads/EBN-api-auth/EBN-api-auth/ETL/yelp_data.txt", "r") as file:
    data = file.read()

# Split the data by each state's entry
entries = data.split("\n\n")

# List to store the extracted information for each business
extracted_data = []
user = 1

password = "AnmolKarki123"
salt = bcrypt.gensalt()
hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)
# Loop through each state's data entry
for entry in entries:
    # Skip empty entries
    if not entry.strip():
        continue

    # Parse the JSON data within each state entry
    try:
        # Find the JSON part by locating the first '{'
        json_data = entry[entry.find("{"):].strip()
        state_data = json.loads(json_data)
        
        # Extract relevant data for each business
        for business in state_data.get("businesses", []):
            
            business_info = {
                "id": user,
                "name": business.get("name", "null"),
                "category": [category.get("title", "null") for category in business.get("categories", [])],
                "location": ", ".join(business.get("location", {}).get("display_address", [])),
                "operating_hours": business.get("business_hours", [{}])[0].get("open",[]),
                "description": business.get("alias", "null"),
                "contact_details": business.get("phone", business.get("display_phone", "null")),
                "username": f"user {user}",
                "user_id": f"{user}",
                "password": f"{hashed_password}",
                "rating": business.get("rating","null"),
                "image_url": business.get("image_url","null"),
                "coordinates": business.get("coordinates",{}),
                "country": business.get("location", {}).get("country","null"),
                "state": business.get("location",{}).get("state","null"),
                "city":  business.get("location",{}).get("state","nul"),
                "price": random.randint(1000, 5000),
                "business_url": business.get("attributes",{}).get("menu_url","null"),
                "email": f"anmol.user{user}@gmail.com",
                "role":"user",
                "user_phone":business.get("display_phone")
            }
            
            user +=1
            extracted_data.append(business_info)
            
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON for entry: {entry[:100]}...")  # Display part of the entry for debugging
   
# Display the extracted data
business_number = 1

with open("/home/anmol/Downloads/EBN-api-auth/EBN-api-auth/ETL/yelp_filtered_data.json", "w") as file:
    file.write("[")

    business_number = 1  # Initialize business_number if it’s not defined before
    for business in extracted_data:
        
        file.write(json.dumps(business, indent=4))  # Use json.dumps() to get a JSON string
        
        file.write(", \n")
        business_number += 1
    file.write("]")





