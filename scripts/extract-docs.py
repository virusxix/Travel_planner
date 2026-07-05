import zipfile
import re
import sys

path = sys.argv[1]
out = sys.argv[2] if len(sys.argv) > 2 else None

with zipfile.ZipFile(path) as z:
    xml = z.read("word/document.xml").decode("utf-8")

text = re.sub(r"</w:p>", "\n", xml)
text = re.sub(r"<w:tab[^/]*/>", "\t", text)
text = re.sub(r"<[^>]+>", "", text)
for a, b in [("&amp;", "&"), ("&lt;", "<"), ("&gt;", ">"), ("&quot;", '"'), ("&apos;", "'")]:
    text = text.replace(a, b)

if out:
    with open(out, "w", encoding="utf-8") as f:
        f.write(text)
    print(f"written {len(text)} -> {out}")
else:
    sys.stdout.reconfigure(encoding="utf-8")
    print(text)
