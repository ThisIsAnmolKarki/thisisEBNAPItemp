import requests
import time
import json

# List of all 50 U.S. state abbreviations
states = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME",
    "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA",
    "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
]

# Your Yelp API key
api_key = "76Rhjg3X0uM7k8GzQW6fdvDSAjgXVr-S-J7O8P6ZEojPaRd4egIFvk8J4vBqqIWSZ52NAR4cxHwiIaOkmTbMq-_1dCHJsAbogvWuq3VYy8r-lMkIT9owcVTLdFAsZ3Yx"

# Headers for the API request
headers = {
    "accept": "application/json",
    "Authorization": f"Bearer {api_key}"
}

# Open a file to store the output
with open("/home/anmol/SoftwareFinal/substitute/EBN-api/ETL/yelp_data.txt", "w") as file:
    # Loop through each state and make the API request
    for state in states:
        url = f"https://api.yelp.com/v3/businesses/search?location={state}"

        try:
            response = requests.get(url, headers=headers)
            if response.status_code == 200:
                data = response.json()  # Get the response JSON

                # Write data to the file
                file.write(f"Data for {state}:\n")
                file.write(json.dumps(data, indent=2))  # Format JSON data
                file.write("\n\n")  # Add spacing between entries

                print(data)

                print(f"Data for {state} written to file.")
            else:
                print(f"Error for {state}: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"Exception for {state}: {e}")
        
        # Add a short delay to avoid hitting rate limits
        time.sleep(1)  # Adjust this if you encounter rate limiting

