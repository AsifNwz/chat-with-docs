import urllib.request
from io import BytesIO
import time
from pathlib import Path
from docling.backend.html_backend import HTMLDocumentBackend
from docling.datamodel.base_models import InputFormat
from docling.datamodel.document import InputDocument
import socket

def url_parser(url):
    # print("📝 Processing:", url)
    start_time = time.time()

    try:
        print("📝 Fetching HTML...")
        # add timeout (60s)
        response = urllib.request.urlopen(url, timeout=60)
        html_bytes = response.read()

    except socket.timeout:
        print(f"⏳ Timeout fetching {url}")
        return None
    except Exception as e:
        print(f"❌ Error fetching {url}: {e}")
        return None

    print("📝 Converting HTML to Markdown...")

    in_doc = InputDocument(
        path_or_stream=BytesIO(html_bytes),
        format=InputFormat.HTML,
        backend=HTMLDocumentBackend,
        filename="duck.html",
    )

    try:
        print("📝 Parsing with Docling...")
        backend = HTMLDocumentBackend(in_doc=in_doc, path_or_stream=BytesIO(html_bytes))
        doc = backend.convert()
    except Exception as e:
        print(f"❌ Error parsing {url}: {e}")
        return None

    # target_dir = Path(__file__).resolve().parents[1] / "uploads_data"
    # target_dir.mkdir(exist_ok=True)

    target_dir = Path("/uploads")
    md_path = target_dir / f"{start_time}.md"
    doc.save_as_markdown(md_path)

    end_time = time.time() - start_time
    print(f"✅ Done! Converted in {end_time:.2f} seconds.")
    # print("📝 Processed:", url, "md_File", f"{start_time}.md")

    return f"{start_time}.md"
