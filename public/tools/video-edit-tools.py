"""
EMERGENCY AUTO-RESTORE
This temporary file downloads the last working video-edit-tools.py
from commit 8d972d4 and replaces itself, then asks you to restart.
"""
import os
import sys
import urllib.request
from pathlib import Path

RESTORE_URL = (
    "https://raw.githubusercontent.com/Kamol-Mahato/farmer-kamol-2/"
    "8d972d4c6982b709bc4be624d4cb0f9f2d7c2891/public/tools/video-edit-tools.py"
)

TARGET = Path(__file__).resolve()

def main() -> None:
    print("=" * 60)
    print("EMERGENCY RESTORE: downloading last working video-edit-tools.py ...")
    print("=" * 60)
    try:
        with urllib.request.urlopen(RESTORE_URL, timeout=120) as resp:
            data = resp.read()
        if len(data) < 50_000:
            raise RuntimeError(f"Downloaded file too small ({len(data)} bytes) — aborting")
        # Safety backup of this bootstrap
        backup = TARGET.with_suffix(".py.bootstrap-bak")
        if TARGET.exists():
            backup.write_bytes(TARGET.read_bytes())
        TARGET.write_bytes(data)
        print(f"OK Restored {len(data)} bytes -> {TARGET}")
        print("Please RESTART the Streamlit app (run_app.bat / streamlit run).")
        print("=" * 60)
    except Exception as e:
        print(f"RESTORE FAILED: {e}")
        print("Manual fix:")
        print("  git checkout 8d972d4c6982b709bc4be624d4cb0f9f2d7c2891 -- public/tools/video-edit-tools.py")
        print("  git commit -m \"Restore video-edit-tools.py\" && git push")
        sys.exit(1)

if __name__ == "__main__":
    main()
else:
    # If imported by Streamlit, restore then exit so user restarts cleanly
    main()
    sys.exit(0)
