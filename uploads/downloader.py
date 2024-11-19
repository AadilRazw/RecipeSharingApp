import requests
import os

# Function to download image
def download_image(url, save_path):
    try:
        # Send GET request to fetch the image
        response = requests.get(url)
        
        # Check if the request was successful (status code 200)
        if response.status_code == 200:
            # Ensure the 'save_path' directory exists, if not create it
            os.makedirs(os.path.dirname(save_path), exist_ok=True)
            
            # Open the file in binary write mode and write the content
            with open(save_path, 'wb') as f:
                f.write(response.content)
            print(f"Image successfully downloaded and saved to {save_path}")
        else:
            print(f"Failed to retrieve the image. HTTP Status Code: {response.status_code}")
    except Exception as e:
        print(f"Error downloading image: {e}")

# Example usage
if __name__ == "__main__":
    # Image URL
    for i in range(1,27):
        image_url = f"https://cdn.dummyjson.com/recipe-images/{i}.webp"  # Replace with the actual image URL
        print(image_url)
    
        # Path to save the image
        save_path = f"C:\\Users\\idris\\OneDrive\\Desktop\\RecipeSharingApp\\backend\\uploads\\{i}.webp"  # You can specify a full path or just a filename
        
        # Download the image
        download_image(image_url, save_path)
