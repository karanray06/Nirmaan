import fitz
import os

doc = fitz.open("brochure.pdf")
os.makedirs("extracted_images", exist_ok=True)

for page_index in range(len(doc)):
    page = doc[page_index]
    image_list = page.get_images(full=True)
    
    if image_list:
        for image_index, img in enumerate(image_list, start=1):
            xref = img[0]
            base_image = doc.extract_image(xref)
            image_bytes = base_image["image"]
            image_ext = base_image["ext"]
            image_filename = f"extracted_images/image{page_index+1}_{image_index}.{image_ext}"
            
            with open(image_filename, "wb") as f:
                f.write(image_bytes)
print("Images extracted")
