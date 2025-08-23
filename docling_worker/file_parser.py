import os
import time

from pathlib import Path
from docling.document_converter import DocumentConverter, PdfFormatOption
from docling.datamodel.accelerator_options import AcceleratorDevice, AcceleratorOptions
from docling.datamodel.base_models import InputFormat
from docling.datamodel.pipeline_options import PdfPipelineOptions, TableFormerMode # TesseractOcrOptions
# from docling_core.types.doc import ImageRefMode


total_cores = os.cpu_count() or 4
num_threads = max(1, total_cores - 2) 

def file_parser(fileName):
  print("📝 Processing:", fileName)
  start_time = time.time()
  # print(start_time)

  # Optional: derive markdown filename from PDF name
  target = Path(fileName).stem
  # print(target)

  pipeline_options = PdfPipelineOptions()

  pipeline_options.do_ocr = True
  # pipeline_options.ocr_options = TesseractOcrOptions()
  # pipeline_options.ocr_options.use_gpu = True 
  pipeline_options.accelerator_options = AcceleratorOptions(
    num_threads=num_threads,
    device=AcceleratorDevice.AUTO
  )

  pipeline_options.do_table_structure = True
  pipeline_options.table_structure_options.do_cell_matching = True
  pipeline_options.table_structure_options.mode = TableFormerMode.ACCURATE

  # pipeline_options.do_code_enrichment = True
  # pipeline_options.do_formula_enrichment = True

  pipeline_options.generate_page_images = True
  pipeline_options.generate_picture_images = True
  pipeline_options.images_scale = 1
  # pipeline_options.do_picture_classification = True
  # pipeline_options.do_picture_description = True



  doc_converter = DocumentConverter(
      format_options={
          InputFormat.PDF: PdfFormatOption(pipeline_options=pipeline_options)
      }
  )

  source_dir = Path("/uploads")
  # print(source_dir)
  # print("Source:", source_dir / fileName)
  doc = doc_converter.convert(source_dir / fileName).document

  # output_dir = Path("/uploads")
  # output_dir.mkdir(exist_ok=True, parents=True)

  # Save output
  # with open(output_dir / f"{target}.md", "w", encoding="utf-8") as fp:
      # fp.write(doc.export_to_markdown())
      #  json.dump(doc.export_to_dict(), fp, indent=2, ensure_ascii=False)

  md_path = source_dir / f"{target}.md"
  # doc.save_as_markdown(md_path, image_mode=ImageRefMode.EMBEDDED)
  doc.save_as_markdown(md_path)


  end_time = time.time() - start_time
  # print(f"Saved: {md_path}")

  print(f"Document converted in {end_time:.2f} seconds.")