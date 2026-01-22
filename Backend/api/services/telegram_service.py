import requests
import os
from typing import Optional
from urllib.parse import urlparse

class TelegramImageService:
    def __init__(self):
        self.bot_token = "8439701093:AAFf95QlBMfIOMleMrLP4CRQggtEHRZY0X4"
        self.base_url = f"https://api.telegram.org/bot{self.bot_token}"
    
    def upload_image(self, image_file) -> Optional[str]:
        """
        Upload image to Telegram and return the file URL
        """
        try:
            # Prepare the files for upload
            files = {
                'photo': ('image.jpg', image_file, 'image/jpeg')
            }
            
            # Send request to Telegram Bot API
            response = requests.post(
                f"{self.base_url}/sendPhoto",
                files=files,
                data={
                    'chat_id': '@mart18999',  # Using the specified channel group
                    'caption': 'Product image uploaded via MartFlow System'
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get('ok'):
                    # Get the file_id from the sent photo
                    photo = result['result']['photo']
                    if photo:
                        file_id = photo[-1]['file_id']  # Get the largest photo
                        # Get the file path from Telegram
                        file_response = requests.get(f"{self.base_url}/getFile?file_id={file_id}")
                        if file_response.status_code == 200:
                            file_data = file_response.json()
                            if file_data.get('ok'):
                                file_path = file_data['result']['file_path']
                                # Construct the file URL
                                file_url = f"https://api.telegram.org/file/bot{self.bot_token}/{file_path}"
                                return file_url
            
            return None
            
        except Exception as e:
            print(f"Error uploading image to Telegram: {e}")
            return None
    
    def upload_image_from_url(self, image_url: str) -> Optional[str]:
        """
        Download image from URL and upload to Telegram
        """
        try:
            # Download the image from the provided URL
            response = requests.get(image_url)
            response.raise_for_status()
            
            # Upload to Telegram
            return self.upload_image(response.content)
            
        except Exception as e:
            print(f"Error downloading/uploading image from URL: {e}")
            return None
    
    def upload_image_from_base64(self, base64_data: str) -> Optional[str]:
        """
        Upload image from base64 data to Telegram
        """
        try:
            import base64
            # Decode base64 data
            image_data = base64.b64decode(base64_data)
            
            # Upload to Telegram
            return self.upload_image(image_data)
            
        except Exception as e:
            print(f"Error uploading base64 image: {e}")
            return None

# Global instance
telegram_service = TelegramImageService()