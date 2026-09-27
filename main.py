import os
from PIL import Image

# Disable safety limit for your large files
Image.MAX_IMAGE_PIXELS = None 

def ultra_compress(input_folder, output_folder, max_width=2500):
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    for filename in os.listdir(input_folder):
        if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            file_path = os.path.join(input_folder, filename)
            
            try:
                with Image.open(file_path) as img:
                    # 1. Resize if the image is massive
                    if img.width > max_width:
                        w_percent = (max_width / float(img.width))
                        h_size = int((float(img.height) * float(w_percent)))
                        img = img.resize((max_width, h_size), Image.Resampling.LANCZOS)
                    
                    # 2. Define output path (changing extension to .webp)
                    base_name = os.path.splitext(filename)[0]
                    output_path = os.path.join(output_folder, f"{base_name}.webp")
                    
                    # 3. Save as WebP with lossy compression (quality 80 is usually perfect)
                    # For vector-style art, 'method=6' provides the best compression ratio
                    img.save(output_path, "WEBP", quality=80, method=6)
                    
                    print(f"✅ Optimized: {filename} -> {base_name}.webp")
                    
            except Exception as e:
                print(f"❌ Error: {filename}: {e}")

# --- Run Settings ---
source_dir = 'public/newimages'  # Folder with your large PNGs
destination_dir = 'public/compressed'  # Folder to save compressed PNGs

ultra_compress(source_dir, destination_dir, max_width=2000) # Limits width to 2000px
