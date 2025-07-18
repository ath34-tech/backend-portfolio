import requests
from bs4 import BeautifulSoup

def get_featured_image(url):
    try:
        # Download the page
        response = requests.get(url, timeout=10)
        response.raise_for_status()

        # Parse the HTML
        soup = BeautifulSoup(response.text, 'html.parser')

        # Try to extract Open Graph image
        og_image = soup.find("meta", property="og:image")
        if og_image and og_image.get("content"):
            return og_image["content"]

        # Fallback: Twitter image cards
        twitter_image = soup.find("meta", attrs={"name": "twitter:image"})
        if twitter_image and twitter_image.get("content"):
            return twitter_image["content"]

        # Final fallback: first <img> tag
        img_tag = soup.find("img")
        if img_tag and img_tag.get("src"):
            return img_tag["src"]

        return "No image found."

    except requests.exceptions.RequestException as e:
        return f"Error fetching URL: {e}"

# --------- Test it ----------
if __name__ == "__main__":
    blog_url = input("Enter blog article URL: ")
    image_url = get_featured_image(blog_url)
    print("📸 Featured image URL:")
    print(image_url)
