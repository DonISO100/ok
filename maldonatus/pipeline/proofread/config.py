"""Paths for the proofread pipeline. Override with environment variables:

  MALD_SCANS  directory of the tom. I scans, one JPEG per image: 0020.jpg ... (BSB bsb11059226, full size)
  MALD_PACK   directory holding bsb11059226_tom1_1596_words.json.gz (Vision word boxes, from the OCR pack)
  MALD_DICT   Hunspell Latin dictionary base path without extension (npm dictionary-la: .../package/index)
  MALD_WORK   scratch directory for batch ids, crops and temporary files (default: ~/maldonatus-work)

Everything that should be kept (raw model answers, reader data, review queue,
reports) is written inside the repository, under maldonatus/.
"""
import os

HERE = os.path.dirname(os.path.abspath(__file__))
PIPE = os.path.dirname(HERE)
MALD = os.path.dirname(PIPE)
REPO = os.path.dirname(MALD)


class _Cfg:
    scans = os.environ.get("MALD_SCANS", os.path.expanduser("~/maldonatus-scans/bsb11059226_tom1_1596"))
    pack = os.environ.get("MALD_PACK", os.path.expanduser("~/maldonatus-pack"))
    dict = os.environ.get("MALD_DICT", os.path.expanduser("~/dictla/package/index"))
    work = os.environ.get("MALD_WORK", os.path.expanduser("~/maldonatus-work"))

    @property
    def words(self):
        return os.path.join(self.pack, "bsb11059226_tom1_1596_words.json.gz")

    raw2 = os.path.join(HERE, "raw")            # Sonnet full-page proofread, prompt v2 (committed)
    raw3 = os.path.join(HERE, "raw3")           # line-ID proofread, prompt v3 (proofread3.py)
    reader = os.path.join(MALD, "reader", "data")
    queue = os.path.join(PIPE, "review-queue.json")
    decisions = os.path.join(PIPE, "review-decisions.json")
    reports = os.path.join(HERE, "reports")
    vulgate = os.path.join(PIPE, "vulgate_gospels.json")
    # reader data from before the proofread (line ids the toc was built on)
    base_commit = "b7ccb18"

    def scan(self, img):
        for ext in (".jpg", ".jpeg", ".png", ".tif"):
            p = os.path.join(self.scans, img + ext)
            if os.path.exists(p):
                return p
        raise FileNotFoundError(f"scan {img} not found in {self.scans} (set MALD_SCANS)")


CFG = _Cfg()
