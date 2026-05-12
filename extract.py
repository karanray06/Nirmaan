import fitz

doc = fitz.open("brochure.pdf")
text = ""
for page in doc:
    text += page.get_text() + "\n\n"

with open("brochure_text.txt", "w", encoding="utf-8") as f:
    f.write(text)
print("Text extracted successfully to brochure_text.txt")
