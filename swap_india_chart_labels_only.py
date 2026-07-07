from pathlib import Path
import shutil
import sys
import tempfile
import zipfile

from lxml import etree


source = Path(sys.argv[1])
output = Path(sys.argv[2])
shutil.copyfile(source, output)

with tempfile.TemporaryDirectory() as temp_dir:
    root = Path(temp_dir)
    with zipfile.ZipFile(output, "r") as archive:
        archive.extractall(root)

    chart_path = root / "word" / "charts" / "chart2.xml"
    tree = etree.parse(str(chart_path))
    ns = {"c": "http://schemas.openxmlformats.org/drawingml/2006/chart"}
    labels = tree.xpath("//c:ser/c:tx//c:v", namespaces=ns)
    if len(labels) < 2 or [labels[0].text, labels[1].text] != ["出口", "进口"]:
        raise RuntimeError("Unexpected chart labels; refusing to modify other content.")
    labels[0].text = "进口"
    labels[1].text = "出口"
    tree.write(chart_path, encoding="UTF-8", xml_declaration=True, standalone=True)

    rebuilt = output.with_suffix(".rebuilt.docx")
    with zipfile.ZipFile(rebuilt, "w", zipfile.ZIP_DEFLATED) as archive:
        for path in root.rglob("*"):
            if path.is_file():
                archive.write(path, path.relative_to(root).as_posix())
    rebuilt.replace(output)
